using MediatR;

namespace ClothingStore.Application.Cart.Commands;

public record GuestCartItemDto(Guid ProductId, Guid ProductVariantId, int Quantity);

public record MergeGuestCartCommand(Guid UserId, IReadOnlyList<GuestCartItemDto> GuestItems)
    : IRequest<IReadOnlyList<CartItemDto>>;
