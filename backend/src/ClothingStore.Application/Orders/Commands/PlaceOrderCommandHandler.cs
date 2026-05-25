using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ClothingStore.Application.Orders.Commands;

public class PlaceOrderCommandHandler(
    IApplicationDbContext context,
    IEmailTemplateBuilder emailTemplateBuilder,
    IEmailNotificationService emailNotificationService,
    IMemoryCache memoryCache
) : IRequestHandler<PlaceOrderCommand, Guid>
{
    public async Task<Guid> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.IdempotencyKey))
        {
            var existingOrder = await context.Orders.FirstOrDefaultAsync(
                x => x.IdempotencyKey == request.IdempotencyKey,
                cancellationToken
            );
            if (existingOrder != null)
            {
                return existingOrder.Id;
            }

            if (
                memoryCache.TryGetValue(
                    $"vnpay_idempotency_{request.IdempotencyKey.Trim()}",
                    out Guid cachedOrderId
                )
            )
            {
                return cachedOrderId;
            }
        }

        if (request.Items.Count == 0)
            throw new InvalidOperationException("Order must contain at least one item.");

        if (request.Items.Any(x => x.Quantity <= 0))
            throw new InvalidOperationException("Item quantity must be greater than zero.");

        var user =
            await context.Users.FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("User does not exist.");
        var ids = request.Items.Select(x => x.ProductId).ToList();
        var products = await context
            .Products.Where(x => ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
        var variantIds = request.Items.Select(x => x.ProductVariantId).ToList();
        var variants = await context
            .ProductVariants.Where(x => variantIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
        var order = new Order
        {
            UserId = request.UserId,
            Status = OrderStatus.Pending,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = PaymentStatus.Unpaid,
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
            IdempotencyKey = string.IsNullOrWhiteSpace(request.IdempotencyKey)
                ? null
                : request.IdempotencyKey.Trim(),
        };
        order.StatusHistories.Add(
            new OrderStatusHistory { Status = order.Status, ChangedAt = DateTime.UtcNow }
        );

        foreach (var item in request.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
                throw new InvalidOperationException("Invalid product.");

            if (!product.IsActive)
                throw new InvalidOperationException(
                    $"Product \"{product.Name}\" is not available."
                );

            if (
                !variants.TryGetValue(item.ProductVariantId, out var variant)
                || variant.ProductId != product.Id
            )
                throw new InvalidOperationException("Invalid order item.");

            if (variant.Quantity < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for product {product.Name} (Size: {variant.Size}, Color: {variant.Color})."
                );

            order.Items.Add(
                new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductSlug = product.Slug,
                    ProductVariantId = variant.Id,
                    VariantName = $"{variant.Size} - {variant.Color}",
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                }
            );
        }

        var subtotal = order.Items.Sum(x => x.Quantity * x.UnitPrice);
        order.TotalAmount = subtotal;

        if (request.ShippingAddressId.HasValue)
        {
            var address =
                await context.ShippingAddresses.FirstOrDefaultAsync(
                    x => x.Id == request.ShippingAddressId.Value && x.UserId == request.UserId,
                    cancellationToken
                ) ?? throw new InvalidOperationException("Invalid shipping address.");
            order.ShippingAddressId = address.Id;
            order.ShippingInfo = new ShippingInfo
            {
                FullName = address.FullName,
                Phone = address.Phone,
                Province = address.Province,
                ProvinceId = address.ProvinceId,
                Ward = address.Ward,
                WardCode = address.WardCode,
                Street = address.Street,
                Label = address.Label,
            };
        }

        Coupon? coupon = null;
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var normalizedCode = request.CouponCode.Trim().ToUpperInvariant();
            coupon = await context.Coupons.FirstOrDefaultAsync(
                x => x.Code == normalizedCode,
                cancellationToken
            );
            if (coupon is null || coupon.Status != CouponStatus.Active)
                throw new InvalidOperationException("Coupon is invalid.");
            var nowUtc = DateTime.UtcNow;
            if (coupon.StartsAt.HasValue && coupon.StartsAt.Value > nowUtc)
                throw new InvalidOperationException("Coupon is not active yet.");
            if (coupon.ExpiresAt <= nowUtc)
                throw new InvalidOperationException("Coupon is expired.");
            if (coupon.UsedCount >= coupon.MaxUsage)
                throw new InvalidOperationException("Coupon usage limit reached.");
            if (subtotal < coupon.MinOrderSubtotal)
                throw new InvalidOperationException("Order does not meet coupon minimum subtotal.");
            var discountAmount = coupon.CalculateDiscountAmount(subtotal);
            if (discountAmount > subtotal)
                throw new InvalidOperationException("Coupon discount exceeds order subtotal.");

            order.CouponId = coupon.Id;
            order.CouponCodeSnapshot = coupon.Code;
            order.CouponDiscountTypeSnapshot = coupon.DiscountType;
            order.CouponDiscountValueSnapshot = coupon.DiscountAmount;
            order.DiscountAmount = discountAmount;
            order.TotalAmount = subtotal - discountAmount;
            if (request.PaymentMethod != PaymentMethod.VNPAY)
            {
                coupon.UsedCount += 1;
            }
        }

        if (request.PaymentMethod == PaymentMethod.VNPAY)
        {
            order.Id = Guid.NewGuid();
            order.MarkAsCreated();

            var cacheEntryOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(
                TimeSpan.FromMinutes(30)
            );

            memoryCache.Set($"vnpay_order_{order.Id}", order, cacheEntryOptions);

            if (!string.IsNullOrWhiteSpace(request.IdempotencyKey))
            {
                memoryCache.Set(
                    $"vnpay_idempotency_{request.IdempotencyKey.Trim()}",
                    order.Id,
                    cacheEntryOptions
                );
            }

            return order.Id;
        }

        await context.Orders.AddAsync(order, cancellationToken);

        order.MarkAsCreated();

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
            when (!string.IsNullOrWhiteSpace(request.IdempotencyKey)
                && (
                    ex.InnerException?.Message.Contains("IdempotencyKey") == true
                    || ex.Message.Contains("IdempotencyKey")
                )
            )
        {
            var existingOrder = await context.Orders.FirstOrDefaultAsync(
                x => x.IdempotencyKey == request.IdempotencyKey,
                cancellationToken
            );
            if (existingOrder != null)
            {
                return existingOrder.Id;
            }
            throw;
        }

        var emailBody = emailTemplateBuilder.BuildOrderPlacedEmail(order, user);
        await emailNotificationService.SendSafeAsync(
            user.Email,
            $"Order Confirmation - {order.Id.ToString().ToUpper()[..8]}",
            emailBody
        );

        return order.Id;
    }
}
