using ClothingStore.API.Services;
using ClothingStore.Application.Orders.Commands;
using ClothingStore.Application.Orders.Queries;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController(ISender sender, IUserContext userContext) : BaseApiController
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
    public async Task<IActionResult> Create(
        [FromBody] AdminCreateOrderCommand command,
        CancellationToken ct
    )
    {
        var id = await sender.Send(command, ct);
        return Ok(id, "Order created.");
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] AdminUpdateOrderStatusRequest request,
        CancellationToken ct
    )
    {
        await sender.Send(new UpdateOrderStatusCommand(id, request.Status), ct);
        return Ok("Order status updated.");
    }

    [HttpPut("bulk/status")]
    public async Task<IActionResult> BulkUpdateStatus(
        [FromBody] AdminBulkUpdateOrderStatusRequest request,
        CancellationToken ct
    )
    {
        var count = await sender.Send(
            new BulkUpdateOrderStatusCommand(request.OrderIds, request.Status),
            ct
        );
        return Ok($"Updated {count} orders.");
    }

    [HttpPost("cancellation-requests/{requestId:guid}/approve")]
    public async Task<IActionResult> ApproveCancellationRequest(
        Guid requestId,
        CancellationToken ct
    )
    {
        var adminId = userContext.GetRequiredUserId();
        await sender.Send(new ApproveCancellationRequestCommand(adminId, requestId), ct);
        return Ok("Cancellation request approved. Order cancelled.");
    }

    [HttpPost("cancellation-requests/{requestId:guid}/reject")]
    public async Task<IActionResult> RejectCancellationRequest(
        Guid requestId,
        [FromBody] AdminRejectCancellationRequestRequest request,
        CancellationToken ct
    )
    {
        var adminId = userContext.GetRequiredUserId();
        await sender.Send(
            new RejectCancellationRequestCommand(adminId, requestId, request.RejectionReason),
            ct
        );
        return Ok("Cancellation request rejected.");
    }
}

public record AdminUpdateOrderStatusRequest(OrderStatus Status);

public record AdminBulkUpdateOrderStatusRequest(List<Guid> OrderIds, OrderStatus Status);

public record AdminRejectCancellationRequestRequest(string RejectionReason);
