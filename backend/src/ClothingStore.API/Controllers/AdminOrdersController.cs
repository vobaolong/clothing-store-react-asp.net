using ClothingStore.Application.Orders.Commands;
using ClothingStore.Application.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClothingStore.Domain.Enums;
namespace ClothingStore.API.Controllers;

[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController(ISender sender) : BaseApiController
{
	[HttpGet]
	public async Task<IActionResult> GetAll([FromQuery] string? status, CancellationToken ct)
	{
		var data = await sender.Send(new GetAdminOrdersQuery(status), ct);
		return Ok(data, "Orders fetched.");
	}

	[HttpGet("{id:guid}")]
	public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
	{
		var order = await sender.Send(new GetAdminOrderDetailQuery(id), ct);
		return Ok(order, "Order fetched.");
	}

	[HttpPost]
	public async Task<IActionResult> Create([FromBody] AdminCreateOrderCommand command, CancellationToken ct)
	{
		var id = await sender.Send(command, ct);
		return Ok(id, "Order created.");
	}

	[HttpPut("{id:guid}/status")]
	public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] AdminUpdateOrderStatusRequest request, CancellationToken ct)
	{
		await sender.Send(new UpdateOrderStatusCommand(id, request.Status), ct);
		return Ok("Order status updated.");
	}

	[HttpPut("bulk/status")]
	public async Task<IActionResult> BulkUpdateStatus([FromBody] AdminBulkUpdateOrderStatusRequest request, CancellationToken ct)
	{
		var count = await sender.Send(new BulkUpdateOrderStatusCommand(request.OrderIds, request.Status), ct);
		return Ok($"Updated {count} orders.");
	}

}

public record AdminUpdateOrderStatusRequest(OrderStatus Status);
public record AdminBulkUpdateOrderStatusRequest(List<Guid> OrderIds, OrderStatus Status);