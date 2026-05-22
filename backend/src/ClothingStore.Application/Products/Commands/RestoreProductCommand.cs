using MediatR;

namespace ClothingStore.Application.Products.Commands;

public record RestoreProductCommand(Guid Id) : IRequest;
public record BulkRestoreProductsCommand(IReadOnlyList<Guid> Ids) : IRequest<int>;

public class RestoreProductCommandHandler(IProductService productService)
		: IRequestHandler<RestoreProductCommand>, IRequestHandler<BulkRestoreProductsCommand, int>
{
	public async Task Handle(RestoreProductCommand request, CancellationToken cancellationToken)
	{
		await productService.RestoreAsync(request.Id, cancellationToken);
	}

	public async Task<int> Handle(BulkRestoreProductsCommand request, CancellationToken cancellationToken)
	{
		return await productService.BulkRestoreAsync(request.Ids, cancellationToken);
	}
}
