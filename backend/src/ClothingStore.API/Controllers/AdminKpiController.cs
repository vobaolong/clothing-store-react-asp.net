using ClothingStore.Application.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/admin/kpi")]
[Authorize(Roles = "Admin")]
public class AdminKpiController(ISender sender) : BaseApiController
{
    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue(
        [FromQuery] string? periodType,
        [FromQuery] int? periodValue,
        [FromQuery] int? year,
        CancellationToken ct
    )
    {
        var data = await sender.Send(new GetRevenueKpiQuery(periodType, periodValue, year), ct);
        return Ok(data, "Revenue KPI fetched.");
    }
}
