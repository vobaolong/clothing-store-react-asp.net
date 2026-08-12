using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record RejectCancellationRequestCommand(
    Guid AdminId,
    Guid RequestId,
    string RejectionReason
) : IRequest<Unit>;
