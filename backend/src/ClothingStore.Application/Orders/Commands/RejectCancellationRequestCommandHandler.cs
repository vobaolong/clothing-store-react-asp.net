using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using ClothingStore.Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class RejectCancellationRequestCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RejectCancellationRequestCommand, Unit>
{
    public async Task<Unit> Handle(
        RejectCancellationRequestCommand request,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(request.RejectionReason))
            throw new ArgumentException("Rejection reason is required.");

        var cancellationRequest = await context
            .CancellationRequests.FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken)
            ?? throw new KeyNotFoundException("Cancellation request not found.");

        if (cancellationRequest.Status != CancellationRequestStatus.Pending)
            throw new InvalidOperationException("Cancellation request has already been processed.");

        cancellationRequest.Status = CancellationRequestStatus.Rejected;
        cancellationRequest.RejectionReason = request.RejectionReason;
        cancellationRequest.ReviewedBy = request.AdminId;
        cancellationRequest.ReviewedAt = DateTime.UtcNow;
        cancellationRequest.AddDomainEvent(
            new CancellationRequestRejectedDomainEvent(cancellationRequest)
        );

        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
