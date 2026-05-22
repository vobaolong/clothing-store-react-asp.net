using MediatR;

namespace ClothingStore.Application.Products.Commands;

public record SoftDeleteProductCommand(Guid Id) : IRequest;
public record BulkSoftDeleteProductsCommand(IReadOnlyList<Guid> Ids) : IRequest<int>;

public class DeleteProductCommandHandler(IProductService productService)
    : IRequestHandler<SoftDeleteProductCommand>, IRequestHandler<BulkSoftDeleteProductsCommand, int>
{
    public async Task Handle(SoftDeleteProductCommand request, CancellationToken cancellationToken)
    {
        await productService.SoftDeleteAsync(request.Id, cancellationToken);
    }

    public async Task<int> Handle(BulkSoftDeleteProductsCommand request, CancellationToken cancellationToken)
    {
        return await productService.SoftDeleteBulkAsync(request.Ids, cancellationToken);
    }
}
