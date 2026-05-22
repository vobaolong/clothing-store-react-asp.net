using ClothingStore.Application.Products;
using MediatR;

namespace ClothingStore.Application.Wishlist.Queries;

public record GetMyWishlistQuery(Guid UserId) : IRequest<IReadOnlyList<ProductDto>>;
