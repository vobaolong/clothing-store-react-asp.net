using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record ApproveCancellationRequestCommand(Guid AdminId, Guid RequestId) : IRequest<Unit>;
