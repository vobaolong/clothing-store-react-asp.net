using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ClothingStore.Application.Tiers;

public record TierConfigDto(
    Guid Id,
    CustomerTier Tier,
    decimal MinSpend,
    decimal DiscountPercent,
    bool FreeShipping
);

public interface ITierConfigService
{
    Task<List<TierConfigDto>> GetAllAsync(CancellationToken ct);
    Task<TierConfigDto> GetByTierAsync(CustomerTier tier, CancellationToken ct);
    Task InvalidateCacheAsync();
}

public class TierConfigService(IApplicationDbContext context, IMemoryCache cache)
    : ITierConfigService
{
    private const string CacheKey = "TierConfigs";

    public async Task<List<TierConfigDto>> GetAllAsync(CancellationToken ct)
    {
        if (cache.TryGetValue(CacheKey, out List<TierConfigDto>? cached) && cached is not null)
            return cached;

        var configs = await context
            .CustomerTierConfigs.OrderBy(c => c.MinSpend)
            .Select(c => new TierConfigDto(c.Id, c.Tier, c.MinSpend, c.DiscountPercent, c.FreeShipping))
            .ToListAsync(ct);

        cache.Set(CacheKey, configs, TimeSpan.FromMinutes(30));
        return configs;
    }

    public async Task<TierConfigDto> GetByTierAsync(CustomerTier tier, CancellationToken ct)
    {
        var all = await GetAllAsync(ct);
        return all.First(c => c.Tier == tier);
    }

    public Task InvalidateCacheAsync()
    {
        cache.Remove(CacheKey);
        return Task.CompletedTask;
    }
}
