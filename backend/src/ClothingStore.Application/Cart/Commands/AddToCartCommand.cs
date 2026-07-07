using MediatR;

namespace ClothingStore.Application.Cart.Commands;

public record AddToCartCommand(Guid UserId, Guid ProductId, Guid ProductVariantId, int Quantity)
    : IRequest<CartItemDto>;
