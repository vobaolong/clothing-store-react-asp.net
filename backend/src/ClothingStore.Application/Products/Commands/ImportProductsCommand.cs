using MediatR;

namespace ClothingStore.Application.Products.Commands;

public record ImportProductsCommand(IReadOnlyList<AdminProductImportRowDto> Rows)
    : IRequest<AdminProductImportResultDto>;

public class ImportProductsCommandHandler(IProductService productService)
    : IRequestHandler<ImportProductsCommand, AdminProductImportResultDto>
{
    public async Task<AdminProductImportResultDto> Handle(
        ImportProductsCommand request,
        CancellationToken cancellationToken
    )
    {
        return await productService.ImportAsync(request.Rows, cancellationToken);
    }
}
