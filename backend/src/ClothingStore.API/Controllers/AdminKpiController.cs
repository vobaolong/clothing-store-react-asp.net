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
    public async Task<IActionResult> GetRevenue(CancellationToken ct)
    {
        var data = await sender.Send(new GetRevenueKpiQuery(), ct);
        return Ok(data, "Revenue KPI fetched.");
    }
}
