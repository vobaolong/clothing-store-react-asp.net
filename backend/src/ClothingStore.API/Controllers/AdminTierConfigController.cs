using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Tiers;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.API.Controllers;

public record UpdateTierConfigRequest(decimal MinSpend, decimal DiscountPercent, bool FreeShipping);

public record CreateTierConfigRequest(
    string Tier,
    decimal MinSpend,
    decimal DiscountPercent,
    bool FreeShipping
);

[Route("api/admin/tier-config")]
[Authorize(Roles = "Admin")]
public class AdminTierConfigController(
    IApplicationDbContext context,
    ITierConfigService configService
) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var configs = await context.CustomerTierConfigs.OrderBy(c => c.MinSpend).ToListAsync(ct);
        return Ok(configs, "Tier configs fetched.");
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTierConfigRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<CustomerTier>(request.Tier, true, out var parsedTier))
            return BadRequest("Invalid tier.");
        if (request.MinSpend < 0)
            return BadRequest("MinSpend must be >= 0.");
        if (request.DiscountPercent < 0 || request.DiscountPercent > 100)
            return BadRequest("DiscountPercent must be 0-100.");

        var exists = await context.CustomerTierConfigs.AnyAsync(c => c.Tier == parsedTier, ct);
        if (exists)
            return BadRequest("Tier already exists.");

        context.CustomerTierConfigs.Add(
            new CustomerTierConfig
            {
                Tier = parsedTier,
                MinSpend = request.MinSpend,
                DiscountPercent = request.DiscountPercent,
                FreeShipping = request.FreeShipping,
            }
        );

        await context.SaveChangesAsync(ct);
        await configService.InvalidateCacheAsync();
        return Ok("Tier config created.");
    }

    [HttpPut("{tier}")]
    public async Task<IActionResult> Update(
        string tier,
        UpdateTierConfigRequest request,
        CancellationToken ct
    )
    {
        if (!Enum.TryParse<CustomerTier>(tier, true, out var parsedTier))
            return BadRequest("Invalid tier.");

        if (parsedTier == CustomerTier.Bronze && request.MinSpend != 0)
            return BadRequest("Bronze must have MinSpend = 0.");
        if (request.MinSpend < 0)
            return BadRequest("MinSpend must be >= 0.");
        if (request.DiscountPercent < 0 || request.DiscountPercent > 100)
            return BadRequest("DiscountPercent must be 0-100.");

        var config = await context.CustomerTierConfigs.FirstOrDefaultAsync(
            c => c.Tier == parsedTier,
            ct
        );
        if (config is null)
            return NotFound("Tier config not found.");

        config.MinSpend = request.MinSpend;
        config.DiscountPercent = request.DiscountPercent;
        config.FreeShipping = request.FreeShipping;

        await context.SaveChangesAsync(ct);
        await configService.InvalidateCacheAsync();
        return Ok("Tier config updated.");
    }

    [HttpDelete("{tier}")]
    public async Task<IActionResult> Delete(string tier, CancellationToken ct)
    {
        if (!Enum.TryParse<CustomerTier>(tier, true, out var parsedTier))
            return BadRequest("Invalid tier.");

        if (parsedTier == CustomerTier.Bronze)
            return BadRequest("Cannot delete Bronze tier.");

        var config = await context.CustomerTierConfigs.FirstOrDefaultAsync(
            c => c.Tier == parsedTier,
            ct
        );
        if (config is null)
            return NotFound("Tier config not found.");

        context.CustomerTierConfigs.Remove(config);
        await context.SaveChangesAsync(ct);
        await configService.InvalidateCacheAsync();
        return Ok("Tier config deleted.");
    }
}
