using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record CancelMyOrderCommand(Guid UserId, Guid OrderId) : IRequest<CancelMyOrderResult>;

public record CancelMyOrderResult(bool Success, string Message, bool NotFound = false);
