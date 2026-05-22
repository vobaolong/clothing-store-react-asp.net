using MediatR;
namespace ClothingStore.Application.Products.Queries;

public record GetProductsQuery() : IRequest<IReadOnlyList<ProductDto>>;
