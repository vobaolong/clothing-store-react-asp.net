using ClothingStore.Application.Orders.Commands;
using ClothingStore.Application.Orders.Queries;
using ClothingStore.API.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/orders")]
[Authorize]
public class OrdersController(ISender sender, IUserContext userContext) : BaseApiController
{
	[HttpGet("my")]
	public async Task<IActionResult> GetMyOrders([FromQuery] string? status, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		var data = await sender.Send(new GetMyOrdersQuery(userId, status), ct);
		return Ok(data, "Orders fetched.");
	}

	[HttpPost]
	public async Task<IActionResult> PlaceOrder(PlaceOrderRequest request, CancellationToken ct)
	{
		if (request.Items.Count == 0)
			return BadRequest("Order must contain at least one item.");

		var userId = userContext.GetRequiredUserId();
		var command = new PlaceOrderCommand(
						userId,
						request.Items.Select(item => new PlaceOrderItem(item.ProductId, item.ProductVariantId, item.Quantity)).ToList(),
						request.CouponCode,
						request.ShippingAddressId,
						request.PaymentMethod,
						request.Note,
						request.IdempotencyKey
		);
		var orderId = await sender.Send(command, ct);
		return Ok(orderId, "Order placed.");
	}

	[HttpGet("my/{id:guid}")]
	public async Task<IActionResult> GetMyOrderDetail(Guid id, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		var order = await sender.Send(new GetMyOrderDetailQuery(userId, id), ct);
		return Ok(order, "Order detail fetched.");
	}

	[HttpPut("my/{id:guid}/cancel")]
	public async Task<IActionResult> CancelMyOrder(Guid id, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		var result = await sender.Send(new CancelMyOrderCommand(userId, id), ct);
		if (result.NotFound)
			return NotFound(result.Message);
		if (!result.Success)
			return BadRequest(result.Message);
		return Ok(result.Message);
	}
}

public record PlaceOrderRequest(
		IReadOnlyList<OrderItemRequest> Items,
		string? CouponCode,
		Guid ShippingAddressId,
		Domain.Enums.PaymentMethod PaymentMethod,
		string? Note,
		string? IdempotencyKey = null
);

public record OrderItemRequest(Guid ProductId, Guid ProductVariantId, int Quantity);