using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class ApproveCancellationRequestCommandHandler(IApplicationDbContext context)
    : IRequestHandler<ApproveCancellationRequestCommand, Unit>
{
    public async Task<Unit> Handle(
        ApproveCancellationRequestCommand request,
        CancellationToken cancellationToken
    )
    {
        var cancellationRequest = await context
            .CancellationRequests
            .Include(r => r.Order)
                .ThenInclude(o => o!.Items)
            .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken)
            ?? throw new KeyNotFoundException("Cancellation request not found.");

        if (cancellationRequest.Status != CancellationRequestStatus.Pending)
            throw new InvalidOperationException("Cancellation request has already been processed.");

        var order = cancellationRequest.Order!;
        if (order.Status is not (OrderStatus.Pending or OrderStatus.Confirmed))
            throw new InvalidOperationException("Order is no longer cancellable.");

        // Restock variants (ported from CancelMyOrderCommandHandler)
        var variantIds = order.Items.Select(i => i.ProductVariantId).ToList();
        var variants = await context
            .ProductVariants.Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);
        foreach (var item in order.Items)
        {
            if (variants.TryGetValue(item.ProductVariantId, out var variant))
                variant.Quantity += item.Quantity;
        }

        order.ChangeStatus(OrderStatus.Cancelled);
        await context.OrderStatusHistories.AddAsync(
            new OrderStatusHistory
            {
                OrderId = order.Id,
                Status = OrderStatus.Cancelled,
                ChangedAt = DateTime.UtcNow,
            },
            cancellationToken
        );

        cancellationRequest.Status = CancellationRequestStatus.Accepted;
        cancellationRequest.ReviewedBy = request.AdminId;
        cancellationRequest.ReviewedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
