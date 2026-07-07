using MediatR;

namespace ClothingStore.Application.Cart.Queries;

public record GetMyCartQuery(Guid UserId) : IRequest<IReadOnlyList<CartItemDto>>;
