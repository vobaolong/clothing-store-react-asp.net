using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ClothingStore.Application.Categories.Queries;

public record GetPublicCategoriesQuery : IRequest<IReadOnlyList<CategoryDto>>;

public class GetPublicCategoriesQueryHandler(IApplicationDbContext context, IMemoryCache cache)
    : IRequestHandler<GetPublicCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(10);

    public async Task<IReadOnlyList<CategoryDto>> Handle(
        GetPublicCategoriesQuery request,
        CancellationToken ct
    )
    {
        if (cache.TryGetValue(CacheKeys.CategoriesPublic, out IReadOnlyList<CategoryDto>? cached))
            return cached!;

        var data = await context
            .Categories.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CategoryDto(
                x.Id,
                x.Name,
                x.Slug,
                x.Image,
                x.Description,
                x.ParentId,
                x.Level,
                x.Gender.ToString().ToLowerInvariant(),
                x.ProductType.HasValue ? x.ProductType.Value.ToString().ToLowerInvariant() : null,
                x.IsActive,
                x.CreatedAt,
                x.UpdatedAt
            ))
            .ToListAsync(ct);
        cache.Set(CacheKeys.CategoriesPublic, data, CacheTtl);
        return data;
    }
}
