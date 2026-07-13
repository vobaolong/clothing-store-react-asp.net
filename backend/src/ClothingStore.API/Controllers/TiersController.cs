using ClothingStore.API.Services;
using ClothingStore.Application.Tiers.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/tiers")]
[Authorize]
public class TiersController(ISender sender, IUserContext userContext) : BaseApiController
{
    [HttpGet("my")]
    public async Task<IActionResult> GetMyTier(CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        var data = await sender.Send(new GetMyTierQuery(userId), ct);
        return Ok(data, "Tier fetched.");
    }
}
