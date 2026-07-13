using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Tiers;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class BulkUpdateOrderStatusCommandHandler(
    IApplicationDbContext context,
    IEmailTemplateBuilder emailTemplateBuilder,
    IEmailNotificationService emailNotificationService,
    ITierService tierService
) : IRequestHandler<BulkUpdateOrderStatusCommand, int>
{
    public async Task<int> Handle(
        BulkUpdateOrderStatusCommand request,
        CancellationToken cancellationToken
    )
    {
        if (request.OrderIds == null || request.OrderIds.Count == 0)
        {
            throw new ArgumentException("OrderIds cannot be empty.");
        }

        var orders = await context
            .Orders.Include(o => o.Items)
            .Include(o => o.User)
            .Where(o => request.OrderIds.Contains(o.Id))
            .ToListAsync(cancellationToken);

        if (orders.Count != request.OrderIds.Count)
        {
            throw new InvalidOperationException("One or more orders not found.");
        }

        int updatedCount = 0;
        var ordersToDeliver = new List<Order>();

        var allItemVariantIds = orders
            .SelectMany(o => o.Items)
            .Select(i => i.ProductVariantId)
            .Distinct()
            .ToList();
        var allItemProductIds = orders
            .SelectMany(o => o.Items)
            .Select(i => i.ProductId)
            .Distinct()
            .ToList();

        var variantsMap = await context
            .ProductVariants.Where(v => allItemVariantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        var productsMap = await context
            .Products.Where(p => allItemProductIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        foreach (var order in orders)
        {
            bool justDelivered =
                request.Status == OrderStatus.Delivered && order.Status != OrderStatus.Delivered;
            bool leavingDelivered =
                order.Status == OrderStatus.Delivered && request.Status != OrderStatus.Delivered;

            if (justDelivered)
            {
                foreach (var item in order.Items)
                {
                    if (productsMap.TryGetValue(item.ProductId, out var product))
                        product.SoldCount += item.Quantity;
                }

                order.PaymentStatus = PaymentStatus.Paid;
                order.PaidAt ??= DateTime.UtcNow;

                if (order.PaymentMethod == PaymentMethod.COD && order.User != null)
                {
                    order.User.TotalSpent += order.TotalAmount;
                    tierService.TouchActivity(order.User);
                    await tierService.RecalculateTierAsync(order.User, cancellationToken);
                }
            }
            else if (leavingDelivered)
            {
                foreach (var item in order.Items)
                {
                    if (productsMap.TryGetValue(item.ProductId, out var product))
                        product.SoldCount -= item.Quantity;
                }

                if (order.PaymentMethod == PaymentMethod.COD)
                {
                    order.PaymentStatus = PaymentStatus.Unpaid;
                    order.PaidAt = null;
                    if (order.User != null)
                        order.User.TotalSpent = Math.Max(
                            0m,
                            order.User.TotalSpent - order.TotalAmount
                        );
                }
            }

            // Khi admin hủy đơn (chưa Delivered), cộng lại tồn kho
            if (
                request.Status == OrderStatus.Cancelled
                && order.Status != OrderStatus.Cancelled
                && order.Status != OrderStatus.Delivered
            )
            {
                foreach (var item in order.Items)
                {
                    if (variantsMap.TryGetValue(item.ProductVariantId, out var variant))
                        variant.Quantity += item.Quantity;
                }
            }

            order.ChangeStatus(request.Status);

            await context.OrderStatusHistories.AddAsync(
                new OrderStatusHistory
                {
                    OrderId = order.Id,
                    Status = request.Status,
                    ChangedAt = DateTime.UtcNow,
                },
                cancellationToken
            );

            if (justDelivered && order.User != null)
            {
                ordersToDeliver.Add(order);
            }

            updatedCount++;
        }

        if (updatedCount > 0)
        {
            await context.SaveChangesAsync(cancellationToken);

            foreach (var order in ordersToDeliver)
            {
                var emailBody = emailTemplateBuilder.BuildOrderDeliveredEmail(order, order.User!);
                await emailNotificationService.SendSafeAsync(
                    order.User!.Email,
                    $"Order Delivered - {order.Id.ToString().ToUpper()[..8]}",
                    emailBody
                );
            }
        }

        return updatedCount;
    }
}
