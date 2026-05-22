using MediatR;

namespace ClothingStore.Application.Products.Commands;

public record SetProductActiveCommand(Guid Id, bool IsActive) : IRequest;
public record BulkSetProductsActiveCommand(IReadOnlyList<Guid> Ids, bool IsActive) : IRequest<int>;

public class SetProductActiveCommandHandler(IProductService productService)
		: IRequestHandler<SetProductActiveCommand>, IRequestHandler<BulkSetProductsActiveCommand, int>
{
	public async Task Handle(SetProductActiveCommand request, CancellationToken cancellationToken)
	{
		await productService.SetActiveAsync(request.Id, request.IsActive, cancellationToken);
	}

	public async Task<int> Handle(BulkSetProductsActiveCommand request, CancellationToken cancellationToken)
	{
		return await productService.BulkSetActiveAsync(request.Ids, request.IsActive, cancellationToken);
	}
}
