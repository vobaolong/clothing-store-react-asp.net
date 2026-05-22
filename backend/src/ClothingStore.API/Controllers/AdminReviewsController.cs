using ClothingStore.Application.Reviews.Commands;
using ClothingStore.Application.Reviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/admin/reviews")]
[Authorize(Roles = "Admin")]
public class AdminReviewsController(ISender sender) : BaseApiController
{
	[HttpGet]
	public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
	{
		var result = await sender.Send(new GetAdminReviewsQuery(page, pageSize), ct);
		return Ok(result, "Admin reviews fetched.");
	}

	[HttpDelete("{id:guid}")]
	public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
	{
		if (id == Guid.Empty) return BadRequest("Invalid review id.");
		await sender.Send(new BulkDeleteReviewsCommand(new[] { id }), ct);
		return Ok("Review deleted.");
	}

	[HttpPost("bulk-delete")]
	public async Task<IActionResult> BulkDelete([FromBody] IReadOnlyList<Guid> ids, CancellationToken ct)
	{
		if (ids is null || ids.Count == 0) return BadRequest("No ids provided.");
		var deleted = await sender.Send(new BulkDeleteReviewsCommand(ids), ct);
		return Ok(deleted, $"Deleted {deleted} review(s).");
	}
}