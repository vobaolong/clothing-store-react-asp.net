using System.Text.Json;
using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace ClothingStore.Application.Categories.Queries;

public record GetPublicCategoriesQuery : IRequest<IReadOnlyList<CategoryDto>>;

public class GetPublicCategoriesQueryHandler(IApplicationDbContext context, IDistributedCache cache)
    : IRequestHandler<GetPublicCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(10);

    public async Task<IReadOnlyList<CategoryDto>> Handle(
        GetPublicCategoriesQuery request,
        CancellationToken ct
    )
    {
        var cachedBytes = await cache.GetAsync(CacheKeys.CategoriesPublic, ct);
        if (cachedBytes is not null)
            return JsonSerializer.Deserialize<List<CategoryDto>>(cachedBytes)!;

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
        await cache.SetAsync(
            CacheKeys.CategoriesPublic,
            JsonSerializer.SerializeToUtf8Bytes(data),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = CacheTtl },
            ct
        );
        return data;
    }
}
