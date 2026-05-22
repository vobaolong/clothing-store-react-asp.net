using MediatR;

namespace ClothingStore.Application.Products.Queries;

public record GetAdminProductsQuery(bool IncludeDeleted = false) : IRequest<IReadOnlyList<AdminProductResponseDto>>;

public class GetAdminProductsQueryHandler(IProductService productService)
		: IRequestHandler<GetAdminProductsQuery, IReadOnlyList<AdminProductResponseDto>>
{
	public async Task<IReadOnlyList<AdminProductResponseDto>> Handle(GetAdminProductsQuery request, CancellationToken cancellationToken)
	{
		if (request.IncludeDeleted)
		{
			return await productService.GetDeletedAsync(cancellationToken);
		}
		return await productService.GetAllAsync(cancellationToken);
	}
}
