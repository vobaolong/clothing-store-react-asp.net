using ClothingStore.Application.Common;
using ClothingStore.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Categories;

public interface ICategoryService
{
    Task<string> BuildCategorySlugAsync(
        string name,
        Guid? parentId,
        Guid? excludeCategoryId,
        CancellationToken ct
    );
}

public class CategoryService(IApplicationDbContext context) : ICategoryService
{
    public async Task<string> BuildCategorySlugAsync(
        string name,
        Guid? parentId,
        Guid? excludeCategoryId,
        CancellationToken ct
    )
    {
        var nameSlug = SlugGenerator.Generate(name);
        if (string.IsNullOrEmpty(nameSlug))
            nameSlug = "category";

        string slug;
        if (parentId.HasValue)
        {
            var parentSlug = await context
                .Categories.AsNoTracking()
                .Where(c => c.Id == parentId.Value)
                .Select(c => c.Slug)
                .FirstOrDefaultAsync(ct);

            slug = string.IsNullOrEmpty(parentSlug) ? nameSlug : $"{parentSlug}-{nameSlug}";
        }
        else
        {
            slug = nameSlug;
        }

        var taken = await context.Categories.AnyAsync(
            c => c.Slug == slug && (!excludeCategoryId.HasValue || c.Id != excludeCategoryId.Value),
            ct
        );

        if (taken)
        {
            throw new InvalidOperationException(
                "This URL slug is already in use. Change the category name or parent."
            );
        }

        return slug;
    }
}
