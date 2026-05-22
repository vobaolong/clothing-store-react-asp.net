using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClothingStore.API.DTOs.Banners;

namespace ClothingStore.API.Controllers;

public class BannersController(IApplicationDbContext context) : BaseApiController
{
	[HttpGet("api/banners/active")]
	[AllowAnonymous]
	public async Task<IActionResult> GetActive(CancellationToken ct)
	{
		var now = DateTime.UtcNow;
		var data = await context
				.Banners.AsNoTracking()
				.Where(banner =>
						banner.IsActive
						&& (banner.StartsAt == null || banner.StartsAt <= now)
						&& (banner.EndsAt == null || banner.EndsAt >= now)
				)
				.OrderByDescending(banner => banner.CreatedAt)
				.ThenByDescending(banner => banner.Id)
				.Select(banner => new
				{
					banner.Id,
					banner.ImageUrl,
					banner.CtaLink,
				})
				.ToListAsync(ct);

		return Ok(data, "Active banners fetched.");
	}

	[HttpGet("api/admin/banners")]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> GetAll(CancellationToken ct)
	{
		var data = await context
				.Banners.AsNoTracking()
				.OrderByDescending(banner => banner.CreatedAt)
				.ThenByDescending(banner => banner.Id)
				.Select(banner => new
				{
					banner.Id,
					banner.ImageUrl,
					banner.CtaLink,
					banner.IsActive,
					banner.StartsAt,
					banner.EndsAt,
					banner.CreatedAt,
				})
				.ToListAsync(ct);

		return Ok(data, "Banners fetched.");
	}

	[HttpPost("api/admin/banners")]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> Create(
			UpsertBannerRequest request,
			CancellationToken ct
	)
	{
		var banner = new Banner();
		MapBannerFromRequest(banner, request);
		await context.Banners.AddAsync(banner, ct);
		await context.SaveChangesAsync(ct);
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
		return Ok("Banner updated.");
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
		return Ok("Banner removed.");
	}

	private static void MapBannerFromRequest(Banner banner, UpsertBannerRequest request)
	{
		var startsAt = ConvertToUtc(request.StartsAt);
		var endsAt = ConvertToUtc(request.EndsAt);

		banner.ImageUrl = request.ImageUrl.Trim();
		banner.CtaLink = request.CtaLink.Trim();
		banner.IsActive = request.IsActive;
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