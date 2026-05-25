using ClothingStore.API.Services;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.ShippingAddresses.Commands;
using ClothingStore.Application.ShippingAddresses.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.API.Controllers;

[Route("api/shipping-addresses")]
[Authorize]
public class ShippingAddressesController(
    ISender sender,
    IUserContext userContext,
    IApplicationDbContext context
) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        var data = await sender.Send(new GetMyShippingAddressesQuery(userId), ct);
        return Ok(data, "Addresses fetched.");
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        UpsertShippingAddressRequest request,
        CancellationToken ct
    )
    {
        var userId = userContext.GetRequiredUserId();
        var id = await sender.Send(
            new UpsertShippingAddressCommand(
                null,
                userId,
                request.FullName,
                request.Phone,
                request.Province,
                request.ProvinceId,
                request.Ward,
                request.WardCode,
                request.Street ?? request.Address,
                request.Label,
                request.IsDefault
            ),
            ct
        );
        return Ok(id, "Address created.");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpsertShippingAddressRequest request,
        CancellationToken ct
    )
    {
        var userId = userContext.GetRequiredUserId();
        await sender.Send(
            new UpsertShippingAddressCommand(
                id,
                userId,
                request.FullName,
                request.Phone,
                request.Province,
                request.ProvinceId,
                request.Ward,
                request.WardCode,
                request.Street ?? request.Address,
                request.Label,
                request.IsDefault
            ),
            ct
        );
        return Ok("Address updated.");
    }

    [HttpPut("{id:guid}/default")]
    public async Task<IActionResult> SetDefault(Guid id, CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        await sender.Send(new SetDefaultShippingAddressCommand(userId, id), ct);
        return Ok("Default address updated.");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        await sender.Send(new DeleteShippingAddressCommand(userId, id), ct);
        return Ok("Address removed.");
    }

    [HttpGet("prefill")]
    public async Task<IActionResult> Prefill(CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        var user = await context
            .Users.AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.FullName, u.Phone })
            .FirstOrDefaultAsync(ct);

        if (user is null)
            return NotFound("User not found.");

        return Ok(user, "Prefill data fetched.");
    }
}

public record UpsertShippingAddressRequest(
    string FullName,
    string Phone,
    string? Province,
    string? ProvinceId,
    string? Ward,
    string? WardCode,
    string? Street,
    string? Address,
    Domain.Enums.ShippingAddressLabel? Label,
    bool IsDefault
);
