using ClothingStore.API.DTOs.Banners;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ClothingStore.API.Controllers;

public class BannersController(IApplicationDbContext context, IMemoryCache cache)
    : BaseApiController
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(10);

    [HttpGet("api/banners/active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive(CancellationToken ct)
    {
        const string cacheKey = "banners:active";
        if (cache.TryGetValue(cacheKey, out object? cachedData))
            return Ok(cachedData, "Active banners fetched.");

        var now = DateTime.UtcNow;
        var data = await context
            .Banners.AsNoTracking()
            .Where(banner =>
                banner.IsActive
                && (banner.StartsAt == null || banner.StartsAt <= now)
                && (banner.EndsAt == null || banner.EndsAt >= now)
            )
            .OrderBy(banner => banner.DisplayOrder)
            .ThenBy(banner => banner.CreatedAt)
            .Select(banner => new
            {
                banner.Id,
                banner.ImageUrl,
                banner.CtaLink,
                banner.DisplayOrder,
            })
            .ToListAsync(ct);

        cache.Set(cacheKey, data, CacheTtl);
        return Ok(data, "Active banners fetched.");
    }

    [HttpGet("api/admin/banners")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var data = await context
            .Banners.AsNoTracking()
            .OrderBy(banner => banner.DisplayOrder)
            .ThenBy(banner => banner.CreatedAt)
            .Select(banner => new
            {
                banner.Id,
                banner.ImageUrl,
                banner.CtaLink,
                banner.IsActive,
                banner.DisplayOrder,
                banner.StartsAt,
                banner.EndsAt,
                banner.CreatedAt,
            })
            .ToListAsync(ct);

        return Ok(data, "Banners fetched.");
    }

    [HttpPost("api/admin/banners")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(UpsertBannerRequest request, CancellationToken ct)
    {
        var banner = new Banner();
        MapBannerFromRequest(banner, request);
        await context.Banners.AddAsync(banner, ct);
        await context.SaveChangesAsync(ct);
        cache.Remove("banners:active");
        return Ok(banner.Id, "Banner created.");
    }

    [HttpPut("api/admin/banners/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        UpsertBannerRequest request,
        CancellationToken ct
    )
    {
        var banner = await context.Banners.FirstOrDefaultAsync(b => b.Id == id, ct);
        if (banner is null)
            return NotFound("Banner not found.");

        MapBannerFromRequest(banner, request);
        await context.SaveChangesAsync(ct);
        cache.Remove("banners:active");
        return Ok("Banner updated.");
    }

    [HttpPut("api/admin/banners/reorder")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reorder(
        [FromBody] IReadOnlyList<BannerReorderItem> items,
        CancellationToken ct
    )
    {
        if (items is null || items.Count == 0)
            return BadRequest("No items provided.");

        var ids = items.Select(i => i.Id).ToList();
        var banners = await context.Banners.Where(b => ids.Contains(b.Id)).ToListAsync(ct);

        foreach (var banner in banners)
        {
            var match = items.FirstOrDefault(i => i.Id == banner.Id);
            if (match is not null)
                banner.DisplayOrder = match.DisplayOrder;
        }

        await context.SaveChangesAsync(ct);
        cache.Remove("banners:active");
        return Ok("Banners reordered.");
    }

    [HttpDelete("api/admin/banners/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var banner = await context.Banners.FirstOrDefaultAsync(b => b.Id == id, ct);
        if (banner is null)
            return NotFound("Banner not found.");

        banner.DeletedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
        cache.Remove("banners:active");
        return Ok("Banner removed.");
    }

    private static void MapBannerFromRequest(Banner banner, UpsertBannerRequest request)
    {
        var startsAt = ConvertToUtc(request.StartsAt);
        var endsAt = ConvertToUtc(request.EndsAt);

        banner.ImageUrl = request.ImageUrl.Trim();
        banner.CtaLink = request.CtaLink.Trim();
        banner.IsActive = request.IsActive;
        banner.DisplayOrder = request.DisplayOrder;
        banner.StartsAt = startsAt;
        banner.EndsAt = endsAt;
    }

    private static DateTime? ConvertToUtc(DateTime? value)
    {
        if (!value.HasValue)
            return null;

        return value.Value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value.Value, DateTimeKind.Local).ToUniversalTime(),
        };
    }
}
