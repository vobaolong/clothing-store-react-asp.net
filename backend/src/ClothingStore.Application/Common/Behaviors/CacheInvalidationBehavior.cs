using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace ClothingStore.Application.Common.Behaviors;

/// <summary>
/// Evicts public read caches after any write command that mutates products,
/// categories, or banners. TTL (10 min) is the backstop; this makes changes
/// appear immediately.
/// </summary>
public class CacheInvalidationBehavior<TRequest, TResponse>(
    IMemoryCache cache
) : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        var response = await next();
        var ns = typeof(TRequest).Namespace ?? string.Empty;

        if (ns.Contains("Products"))
            cache.Remove(CacheKeys.ProductsPublic);
        if (ns.Contains("Categories"))
            cache.Remove(CacheKeys.CategoriesPublic);

        return response;
    }
}
