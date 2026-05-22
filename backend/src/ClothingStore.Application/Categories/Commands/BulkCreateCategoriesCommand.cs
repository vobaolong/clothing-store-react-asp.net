using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Categories.Commands;

public record BulkCreateCategoriesCommand(
    IReadOnlyList<CategoryBulkItemDto> Items,
    Guid? ParentId = null,
    Gender? Gender = null,
    ProductType? ProductType = null,
    bool? IsActive = null
) : IRequest<IReadOnlyList<Guid>>;

public class BulkCreateCategoriesCommandHandler(IApplicationDbContext context, ICategoryService categoryService)
    : IRequestHandler<BulkCreateCategoriesCommand, IReadOnlyList<Guid>>
{
    public async Task<IReadOnlyList<Guid>> Handle(BulkCreateCategoriesCommand request, CancellationToken ct)
    {
        var rows = request.Items
            .Select(i => new { Name = i.Name.Trim(), Image = i.Image?.Trim(), Description = i.Description?.Trim() })
            .Where(i => i.Name.Length > 0)
            .ToList();

        if (rows.Count == 0)
            throw new ArgumentException("No category names provided.");

        if (request.ParentId.HasValue)
        {
            var parentExists = await context.Categories.AnyAsync(c => c.Id == request.ParentId.Value, ct);
            if (!parentExists)
                throw new InvalidOperationException("Parent category not found.");
        }

        await using var tx = await context.Database.BeginTransactionAsync(ct);
        var createdIds = new List<Guid>();
        try
        {
            foreach (var row in rows)
            {
                var slug = await categoryService.BuildCategorySlugAsync(row.Name, request.ParentId, null, ct);

                var category = new Category
                {
                    Name = row.Name,
                    Slug = slug,
                    Description = row.Description,
                    ParentId = request.ParentId,
                    Level = (byte)(request.ParentId.HasValue ? 1 : 0),
                    Gender = request.Gender ?? Gender.Unisex,
                    ProductType = request.ProductType,
                    Image = string.IsNullOrWhiteSpace(row.Image) ? null : row.Image,
                    IsActive = request.IsActive ?? true,
                };
                await context.Categories.AddAsync(category, ct);
                await context.SaveChangesAsync(ct);
                createdIds.Add(category.Id);
            }

            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }

        return createdIds;
    }
}
