using ClothingStore.API.Services;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Users.Commands;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.API.Controllers;

public record LockCustomerRequest(string? Reason);

public record OverrideTierRequest(CustomerTier NewTier, string? Reason);

[Route("api/admin/customers")]
[Authorize(Roles = "Admin")]
public class AdminCustomersController(
    IApplicationDbContext context,
    IMediator mediator,
    IUserContext userContext
) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? tier, CancellationToken ct)
    {
        var query = context.Users.AsNoTracking().Where(x => !x.IsAdmin);

        if (
            !string.IsNullOrWhiteSpace(tier)
            && Enum.TryParse<CustomerTier>(tier, true, out var parsedTier)
        )
        {
            query = query.Where(x => x.Tier == parsedTier);
        }

        var data = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                Name = x.FullName,
                x.Phone,
                x.Email,
                Status = x.IsLocked ? "locked" : "active",
                Tier = x.Tier.ToString(),
                x.TotalSpent,
                x.CreatedAt,
            })
            .ToListAsync(ct);

        return Ok(data, "Admin customers fetched.");
    }

    [HttpGet("tier-summary")]
    public async Task<IActionResult> GetTierSummary(CancellationToken ct)
    {
        var data = await context
            .Users.AsNoTracking()
            .Where(x => !x.IsAdmin)
            .GroupBy(x => x.Tier)
            .Select(g => new { Tier = g.Key.ToString(), Count = g.Count() })
            .ToListAsync(ct);

        return Ok(data, "Tier summary fetched.");
    }

    [HttpPut("{id:guid}/lock")]
    public async Task<IActionResult> Lock(
        Guid id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] LockCustomerRequest? body,
        CancellationToken ct
    )
    {
        await mediator.Send(new LockUserCommand(id, body?.Reason), ct);
        return Ok("Customer locked.");
    }

    [HttpPut("{id:guid}/unlock")]
    public async Task<IActionResult> Unlock(Guid id, CancellationToken ct)
    {
        await mediator.Send(new UnlockUserCommand(id), ct);
        return Ok("Customer unlocked.");
    }

    [HttpPut("{id:guid}/tier")]
    public async Task<IActionResult> OverrideTier(
        Guid id,
        OverrideTierRequest request,
        CancellationToken ct
    )
    {
        var adminId = userContext.GetRequiredUserId();

        var user =
            await context.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new InvalidOperationException("Customer not found.");

        var fromTier = user.Tier;
        user.Tier = request.NewTier;

        context.CustomerTierChangeLogs.Add(
            new CustomerTierChangeLog
            {
                CustomerId = id,
                ChangedById = adminId,
                FromTier = fromTier,
                ToTier = request.NewTier,
                Reason = request.Reason,
            }
        );

        await context.SaveChangesAsync(ct);
        return Ok("Customer tier updated.");
    }
}
