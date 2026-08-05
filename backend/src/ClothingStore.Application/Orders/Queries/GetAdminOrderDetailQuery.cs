using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Queries;

public record GetAdminOrderDetailQuery(Guid OrderId) : IRequest<OrderDetailDto>;

public class GetAdminOrderDetailQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminOrderDetailQuery, OrderDetailDto>
{
    public async Task<OrderDetailDto> Handle(GetAdminOrderDetailQuery request, CancellationToken ct)
    {
        var order =
            await context
                .Orders.AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Items)
                    .ThenInclude(i => i.ProductVariant)
                .Include(o => o.StatusHistories)
                .Where(o => o.Id == request.OrderId)
                .FirstOrDefaultAsync(ct)
            ?? throw new KeyNotFoundException("Order not found.");

        var effectivePaymentStatus =
            order.Status == OrderStatus.Delivered ? PaymentStatus.Paid : order.PaymentStatus;

        var items = order
            .Items.Select(item => new OrderDetailItemDto(
                item.Id,
                item.ProductId,
                !string.IsNullOrWhiteSpace(item.ProductName)
                    ? item.ProductName
                    : item.Product!.Name!,
                item.ProductVariantId,
                !string.IsNullOrWhiteSpace(item.ProductSlug)
                    ? item.ProductSlug
                    : item.Product!.Slug!,
                item.ProductVariant?.Size,
                item.ProductVariant?.Color,
                item.Quantity,
                item.UnitPrice,
                item.Quantity * item.UnitPrice,
                null,
                null,
                item.ProductVariant?.ImageUrl
            ))
            .ToList();

        return new OrderDetailDto(
            order.Id,
            order.CreatedAt,
            order.Status,
            order.TotalAmount,
            order.PaymentMethod,
            effectivePaymentStatus,
            order.PaidAt,
            order.CouponCodeSnapshot,
            order.CouponDiscountTypeSnapshot,
            order.CouponDiscountValueSnapshot,
            order.DiscountAmount,
            order.ShippingInfo.FullName,
            order.ShippingInfo.Phone,
            order.ShippingInfo.Street,
            order.ShippingInfo.Province,
            order.ShippingInfo.ProvinceId,
            order.ShippingInfo.Ward,
            order.ShippingInfo.WardCode,
            order.ShippingInfo.Street,
            order.ShippingInfo.Label?.ToString(),
            order.Note,
            order.UpdatedAt,
            order
                .StatusHistories.OrderBy(h => h.ChangedAt)
                .Select(h => new OrderStatusHistoryDto(h.Status, h.ChangedAt))
                .ToList(),
            items,
            order.User?.FullName,
            order.User?.Email
        );
    }
}
