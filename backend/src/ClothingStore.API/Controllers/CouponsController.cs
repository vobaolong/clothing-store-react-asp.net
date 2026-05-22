using ClothingStore.Application.Coupons.Commands;
using ClothingStore.Application.Coupons.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClothingStore.Domain.Enums;

namespace ClothingStore.API.Controllers;

[Route("api/coupons")]
public class CouponsController(ISender sender) : BaseApiController
{
	[HttpPost]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> Create(CreateCouponCommand command, CancellationToken ct)
	{
		var id = await sender.Send(command, ct);
		return Ok(id, "Coupon created.");
	}

	[HttpGet]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> List([FromQuery] CouponStatus? status, CancellationToken ct)
	{
		var data = await sender.Send(new GetAdminCouponsQuery(Status: status), ct);
		return Ok(data, "Coupons fetched.");
	}

	[HttpGet("available")]
	[AllowAnonymous]
	public async Task<IActionResult> Available(CancellationToken ct)
	{
		var data = await sender.Send(new GetAvailableCouponsQuery(), ct);
		return Ok(data, "Available coupons fetched.");
	}

	[HttpPut("{id:guid}")]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCouponRequest request, CancellationToken ct)
	{
		await sender.Send(new UpdateCouponCommand(
				id,
				request.Code,
				request.DiscountType,
				request.DiscountAmount,
				request.MinOrderSubtotal,
				request.MaxUsage,
				request.ExpiresAt,
				request.StartsAt,
				request.Status
		), ct);
		return Ok("Coupon updated.");
	}

	[HttpDelete("{id:guid}")]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
	{
		await sender.Send(new DeleteCouponCommand(id), ct);
		return Ok("Coupon processed.");
	}

	[HttpPost("validate")]
	[AllowAnonymous]
	public async Task<IActionResult> Validate(ValidateCouponRequest request, CancellationToken ct)
	{
		var data = await sender.Send(new ValidateCouponQuery(request.Code, request.OrderTotal), ct);
		return Ok(data, "Coupon is valid.");
	}
}

public record UpdateCouponRequest(
		string? Code,
		CouponDiscountType? DiscountType,
		decimal? DiscountAmount,
		decimal? MinOrderSubtotal,
		int? MaxUsage,
		DateTime? ExpiresAt,
		DateTime? StartsAt,
		CouponStatus? Status
);

public record ValidateCouponRequest(string Code, decimal OrderTotal);