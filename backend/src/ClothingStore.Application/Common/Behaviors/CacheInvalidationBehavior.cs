using MediatR;
using Microsoft.Extensions.Caching.Distributed;

namespace ClothingStore.Application.Common.Behaviors;

/// <summary>
/// Evicts public read caches after any write command that mutates products,
/// categories, or banners. TTL (10 min) is the backstop; this makes changes
/// appear immediately.
/// </summary>
public class CacheInvalidationBehavior<TRequest, TResponse>(
    IDistributedCache cache
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
            await cache.RemoveAsync(CacheKeys.ProductsPublic, cancellationToken);
        if (ns.Contains("Categories"))
            await cache.RemoveAsync(CacheKeys.CategoriesPublic, cancellationToken);

        return response;
    }
}
