using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Categories.Commands;

public record CreateCategoryCommand(CategoryUpsertDto Dto) : IRequest<Guid>;

public class CreateCategoryCommandHandler(IApplicationDbContext context, ICategoryService categoryService)
    : IRequestHandler<CreateCategoryCommand, Guid>
{
    public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var dto = request.Dto;
        if (dto.ParentId.HasValue)
        {
            var parentExists = await context.Categories.AnyAsync(c => c.Id == dto.ParentId.Value, ct);
            if (!parentExists)
                throw new InvalidOperationException("Parent category not found.");
        }

        var slug = await categoryService.BuildCategorySlugAsync(dto.Name, dto.ParentId, null, ct);

        var category = new Category
        {
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description?.Trim(),
            ParentId = dto.ParentId,
            Level = dto.Level ?? (byte)(dto.ParentId.HasValue ? 1 : 0),
            Gender = dto.Gender ?? Gender.Unisex,
            ProductType = dto.ProductType,
            Image = dto.Image?.Trim(),
            IsActive = dto.IsActive ?? true,
        };

        await context.Categories.AddAsync(category, ct);
        await context.SaveChangesAsync(ct);
        return category.Id;
    }
}
