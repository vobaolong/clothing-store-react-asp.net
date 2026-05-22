using MediatR;

namespace ClothingStore.Application.Products.Commands;

public record DeleteProductPermanentCommand(Guid Id) : IRequest;
public record BulkDeleteProductsPermanentCommand(IReadOnlyList<Guid> Ids) : IRequest<int>;

public class DeleteProductPermanentCommandHandler(IProductService productService)
    : IRequestHandler<DeleteProductPermanentCommand>, IRequestHandler<BulkDeleteProductsPermanentCommand, int>
{
    public async Task Handle(DeleteProductPermanentCommand request, CancellationToken cancellationToken)
    {
        await productService.DeletePermanentAsync(request.Id, cancellationToken);
    }

    public async Task<int> Handle(BulkDeleteProductsPermanentCommand request, CancellationToken cancellationToken)
    {
        return await productService.BulkDeletePermanentAsync(request.Ids, cancellationToken);
    }
}
