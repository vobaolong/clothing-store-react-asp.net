using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class CancelMyOrderCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CancelMyOrderCommand, CancelMyOrderResult>
{
    public async Task<CancelMyOrderResult> Handle(
        CancelMyOrderCommand request,
        CancellationToken cancellationToken
    )
    {
        var order = await context
            .Orders.Include(x => x.StatusHistories)
            .Include(x => x.Items)
            .FirstOrDefaultAsync(
                x => x.UserId == request.UserId && x.Id == request.OrderId,
                cancellationToken
            );
        if (order is null)
            return new CancelMyOrderResult(false, "Order not found.", true);

        if (order.Status is OrderStatus.Cancelled)
            return new CancelMyOrderResult(false, "Order is already cancelled.");

        if (order.Status is OrderStatus.Shipping or OrderStatus.Delivered)
        {
            return new CancelMyOrderResult(
                false,
                "You can only cancel orders before shipping starts."
            );
        }

        // Cộng lại tồn kho khi hủy đơn
        var variantIds = order.Items.Select(i => i.ProductVariantId).ToList();
        var variants = await context
            .ProductVariants.Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        foreach (var item in order.Items)
        {
            if (variants.TryGetValue(item.ProductVariantId, out var variant))
                variant.Quantity += item.Quantity;
        }

        order.Status = OrderStatus.Cancelled;
        await context.OrderStatusHistories.AddAsync(
            new OrderStatusHistory
            {
                OrderId = order.Id,
                Status = OrderStatus.Cancelled,
                ChangedAt = DateTime.UtcNow,
            },
            cancellationToken
        );
        await context.SaveChangesAsync(cancellationToken);

        return new CancelMyOrderResult(true, "Order cancelled.");
    }
}
