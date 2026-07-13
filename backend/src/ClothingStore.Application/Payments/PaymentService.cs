using System.Text.RegularExpressions;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Tiers;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using VNPAY.Models;

namespace ClothingStore.Application.Payments;

public interface IPaymentService
{
    Task<Order?> FindOrderForPaymentResultAsync(
        VnpayPaymentResult paymentResult,
        CancellationToken ct
    );
    Task MarkOrderPaidAsync(Order order, CancellationToken ct);
}

public class PaymentService(
    IApplicationDbContext context,
    IEmailTemplateBuilder emailTemplateBuilder,
    IEmailNotificationService emailNotificationService,
    IMemoryCache memoryCache,
    ITierService tierService
) : IPaymentService
{
    public async Task<Order?> FindOrderForPaymentResultAsync(
        VnpayPaymentResult paymentResult,
        CancellationToken ct
    )
    {
        var byTxnRef = await context.Orders.FirstOrDefaultAsync(
            o => o.PaymentTransactionId == paymentResult.PaymentId.ToString(),
            ct
        );
        if (byTxnRef is not null)
            return byTxnRef;

        var orderIdFromDescription = ExtractOrderId(paymentResult.Description);
        if (orderIdFromDescription is not null)
        {
            var byDbId = await context.Orders.FirstOrDefaultAsync(
                o => o.Id == orderIdFromDescription.Value,
                ct
            );
            if (byDbId is not null)
                return byDbId;

            if (
                memoryCache.TryGetValue(
                    $"vnpay_order_{orderIdFromDescription.Value}",
                    out Order? cachedOrder
                )
            )
                return cachedOrder;
        }

        return null;
    }

    public async Task MarkOrderPaidAsync(Order order, CancellationToken ct)
    {
        var nowUtc = DateTime.UtcNow;
        order.PaymentStatus = PaymentStatus.Paid;
        order.PaidAt ??= nowUtc;

        var existsInDb = await context.Orders.AnyAsync(o => o.Id == order.Id, ct);
        if (!existsInDb)
        {
            await context.Orders.AddAsync(order, ct);
            if (order.CouponId.HasValue)
            {
                var coupon = await context.Coupons.FirstOrDefaultAsync(
                    c => c.Id == order.CouponId.Value,
                    ct
                );
                if (coupon != null)
                {
                    coupon.UsedCount += 1;
                }
            }

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == order.UserId, ct);
            if (user != null)
            {
                var emailBody = emailTemplateBuilder.BuildOrderPlacedEmail(order, user);
                await emailNotificationService.SendSafeAsync(
                    user.Email,
                    $"Order Confirmation - {order.Id.ToString().ToUpper()[..8]}",
                    emailBody
                );
            }
        }

        if (order.Status != OrderStatus.Confirmed)
        {
            order.ChangeStatus(OrderStatus.Confirmed);
            await context.OrderStatusHistories.AddAsync(
                new OrderStatusHistory
                {
                    OrderId = order.Id,
                    Status = OrderStatus.Confirmed,
                    ChangedAt = nowUtc,
                },
                ct
            );
        }

        await context.SaveChangesAsync(ct);

        // Recalculate customer tier after order paid
        var userForTier = await context.Users.FirstOrDefaultAsync(u => u.Id == order.UserId, ct);
        if (userForTier != null)
        {
            userForTier.TotalSpent += order.TotalAmount;
            tierService.TouchActivity(userForTier);
            await tierService.RecalculateTierAsync(userForTier, ct);
            await context.SaveChangesAsync(ct);
        }

        memoryCache.Remove($"vnpay_order_{order.Id}");
        if (!string.IsNullOrWhiteSpace(order.IdempotencyKey))
        {
            memoryCache.Remove($"vnpay_idempotency_{order.IdempotencyKey.Trim()}");
        }
    }

    private static Guid? ExtractOrderId(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return null;

        var match = Regex.Match(
            input,
            "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
        );
        if (!match.Success)
            return null;

        return Guid.TryParse(match.Value, out var orderId) ? orderId : null;
    }
}
