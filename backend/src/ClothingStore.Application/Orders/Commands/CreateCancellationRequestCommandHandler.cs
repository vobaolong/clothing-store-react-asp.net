using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using ClothingStore.Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class CreateCancellationRequestCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateCancellationRequestCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateCancellationRequestCommand request,
        CancellationToken cancellationToken
    )
    {
        var order = await context.Orders.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Order not found.");

        if (order.UserId != request.UserId)
            throw new UnauthorizedAccessException("You can only request cancellation for your own orders.");

        if (order.Status is not (OrderStatus.Pending or OrderStatus.Confirmed))
            throw new InvalidOperationException("You can only request cancellation before shipping starts.");

        var exists = await context.CancellationRequests.AsNoTracking()
            .AnyAsync(r => r.OrderId == request.OrderId, cancellationToken);
        if (exists)
            throw new InvalidOperationException("A cancellation request already exists for this order.");

        var cancellationRequest = new CancellationRequest
        {
            OrderId = order.Id,
            UserId = order.UserId,
            Reason = request.Reason,
            Note = request.Note,
            Status = CancellationRequestStatus.Pending,
        };
        cancellationRequest.AddDomainEvent(new CancellationRequestCreatedDomainEvent(cancellationRequest));
        context.CancellationRequests.Add(cancellationRequest);
        await context.SaveChangesAsync(cancellationToken);

        return cancellationRequest.Id;
    }
}
