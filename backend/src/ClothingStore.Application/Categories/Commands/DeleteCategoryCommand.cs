using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Categories.Commands;

public record DeleteCategoryCommand(Guid Id) : IRequest;

public class DeleteCategoryCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteCategoryCommand>
{
    public async Task Handle(DeleteCategoryCommand request, CancellationToken ct)
    {
        var category = await context.Categories.FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new KeyNotFoundException("Category not found.");

        var hasProducts = await context.Products.AnyAsync(x => x.CategoryId == request.Id, ct);
        if (hasProducts)
            throw new InvalidOperationException("Cannot delete category because it still has products.");

        category.DeletedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
    }
}
