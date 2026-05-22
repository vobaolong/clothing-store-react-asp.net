using ClothingStore.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using MediatR;
using ClothingStore.Application.Users.Commands;

namespace ClothingStore.API.Controllers;

public record LockCustomerRequest(string? Reason);

[Route("api/admin/customers")]
[Authorize(Roles = "Admin")]
public class AdminCustomersController(
		IApplicationDbContext context,
		IMediator mediator
) : BaseApiController
{
	[HttpGet]
	public async Task<IActionResult> GetAll(CancellationToken ct)
	{
		var data = await context
				.Users.AsNoTracking()
				.Where(x => !x.IsAdmin)
				.OrderByDescending(x => x.CreatedAt)
				.Select(x => new
				{
					x.Id,
					Name = x.FullName,
					x.Phone,
					x.Email,
					Status = x.IsLocked ? "locked" : "active",
					x.CreatedAt
				})
				.ToListAsync(ct);

		return Ok(data, "Admin customers fetched.");
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
}