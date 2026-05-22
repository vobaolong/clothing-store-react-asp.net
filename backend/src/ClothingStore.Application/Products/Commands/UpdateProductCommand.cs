using MediatR;

namespace ClothingStore.Application.Products.Commands;

public record UpdateProductCommand(Guid Id, AdminProductUpsertDto Dto) : IRequest<Guid>;

public class UpdateProductCommandHandler(IProductService productService)
		: IRequestHandler<UpdateProductCommand, Guid>
{
	public async Task<Guid> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
	{
		return await productService.UpdateAsync(request.Id, request.Dto, cancellationToken);
	}
}
