using MediatR;

namespace ClothingStore.Application.Cart.Commands;

public record RemoveFromCartCommand(Guid UserId, Guid CartItemId) : IRequest;
