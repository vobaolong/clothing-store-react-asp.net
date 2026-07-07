using MediatR;

namespace ClothingStore.Application.Cart.Commands;

public record UpdateCartItemQuantityCommand(Guid UserId, Guid CartItemId, int Quantity)
    : IRequest<CartItemDto>;
