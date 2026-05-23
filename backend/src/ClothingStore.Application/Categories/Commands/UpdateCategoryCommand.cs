using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Categories.Commands;

public record UpdateCategoryCommand(Guid Id, CategoryUpsertDto Dto) : IRequest;

public class UpdateCategoryCommandHandler(
    IApplicationDbContext context,
    ICategoryService categoryService
) : IRequestHandler<UpdateCategoryCommand>
{
    public async Task Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category =
            await context.Categories.FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new KeyNotFoundException("Category not found.");

        var dto = request.Dto;
        if (dto.ParentId.HasValue)
        {
            var parentExists = await context.Categories.AnyAsync(
                c => c.Id == dto.ParentId.Value,
                ct
            );
            if (!parentExists)
                throw new InvalidOperationException("Parent category not found.");
            if (dto.ParentId.Value == request.Id)
                throw new InvalidOperationException("Category cannot be its own parent.");
        }

        category.Name = dto.Name;
        category.Slug = await categoryService.BuildCategorySlugAsync(
            dto.Name,
            dto.ParentId,
            request.Id,
            ct
        );
        category.Description = dto.Description?.Trim();
        category.ParentId = dto.ParentId;
        category.Level = dto.Level ?? (byte)(dto.ParentId.HasValue ? 1 : 0);
        category.Gender = dto.Gender ?? category.Gender;
        category.ProductType = dto.ProductType;
        category.Image = dto.Image?.Trim();
        category.IsActive = dto.IsActive ?? category.IsActive;

        await context.SaveChangesAsync(ct);
    }
}
