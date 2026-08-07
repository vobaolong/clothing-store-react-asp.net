using System.Text.Json;
using AutoMapper;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace ClothingStore.Application.Products.Queries;

public class GetProductsQueryHandler(IApplicationDbContext context, IMapper mapper, IDistributedCache cache)
    : IRequestHandler<GetProductsQuery, IReadOnlyList<ProductDto>>
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(10);

    public async Task<IReadOnlyList<ProductDto>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken
    )
    {
        var cachedBytes = await cache.GetAsync(CacheKeys.ProductsPublic, cancellationToken);
        if (cachedBytes is not null)
            return JsonSerializer.Deserialize<List<ProductDto>>(cachedBytes)!;

        var entities = await context
            .Products.AsNoTracking()
            .Where(x => x.IsActive)
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .ToListAsync(cancellationToken);

        var categoryMap = await LoadAncestorCategoryMap(
            context,
            entities.Select(e => e.CategoryId).Distinct(),
            cancellationToken
        );
        var dtos = mapper.Map<List<ProductDto>>(entities);
        for (var i = 0; i < dtos.Count; i++)
            dtos[i] = dtos[i] with
            {
                CategoryBreadcrumbs = BuildCategoryBreadcrumbs(entities[i].CategoryId, categoryMap),
            };

        await cache.SetAsync(
            CacheKeys.ProductsPublic,
            JsonSerializer.SerializeToUtf8Bytes(dtos),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = CacheTtl },
            cancellationToken
        );
        return dtos;
    }

    private static async Task<Dictionary<Guid, Category>> LoadAncestorCategoryMap(
        IApplicationDbContext context,
        IEnumerable<Guid> productCategoryIds,
        CancellationToken cancellationToken
    )
    {
        var pending = new HashSet<Guid>(productCategoryIds);
        var map = new Dictionary<Guid, Category>();

        while (pending.Count > 0)
        {
            var batch = pending.ToArray();
            pending.Clear();
            var rows = await context
                .Categories.AsNoTracking()
                .Where(c => batch.Contains(c.Id))
                .ToListAsync(cancellationToken);
            foreach (var c in rows)
            {
                map[c.Id] = c;
                if (c.ParentId is { } pid && !map.ContainsKey(pid))
                    pending.Add(pid);
            }
        }

        return map;
    }

    private static IReadOnlyList<CategoryBreadcrumbDto> BuildCategoryBreadcrumbs(
        Guid leafCategoryId,
        IReadOnlyDictionary<Guid, Category> map
    )
    {
        var list = new List<CategoryBreadcrumbDto>();
        var id = leafCategoryId;
        var guard = new HashSet<Guid>();
        while (map.TryGetValue(id, out var c) && !guard.Contains(c.Id))
        {
            guard.Add(c.Id);
            list.Insert(0, new CategoryBreadcrumbDto(c.Id, c.Name, c.Slug));
            if (c.ParentId is null)
                break;
            id = c.ParentId.Value;
        }

        return list;
    }
}
