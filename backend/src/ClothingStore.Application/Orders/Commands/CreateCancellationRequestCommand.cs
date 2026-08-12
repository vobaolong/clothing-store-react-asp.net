using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record CreateCancellationRequestCommand(
    Guid UserId,
    Guid OrderId,
    string Reason,
    string? Note = null
) : IRequest<Guid>;
