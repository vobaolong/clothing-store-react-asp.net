using ClothingStore.Application.Notifications.Commands;
using ClothingStore.Application.Notifications.Queries;
using ClothingStore.API.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/notifications")]
[Authorize]
public class NotificationsController(ISender sender, IUserContext userContext) : BaseApiController
{
	[HttpGet]
	public async Task<IActionResult> GetNotifications([FromQuery] GetNotificationsRequest request, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		var data = await sender.Send(new GetMyNotificationsQuery(userId, request.IsRead, request.Page, request.PageSize), ct);
		return Ok(data, "Notifications retrieved successfully.");
	}

	[HttpPut("{id:guid}/read")]
	public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		await sender.Send(new MarkNotificationAsReadCommand(userId, id), ct);
		return Ok("Notification marked as read.");
	}

	[HttpPut("read-all")]
	public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		await sender.Send(new MarkNotificationAsReadCommand(userId, null), ct);
		return Ok("All notifications marked as read.");
	}

	[HttpGet("unread-count")]
	public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		var count = await sender.Send(new GetUnreadNotificationsCountQuery(userId), ct);
		return Ok(count, "Unread count retrieved successfully.");
	}
}

public record GetNotificationsRequest(bool? IsRead, int Page = 1, int PageSize = 10);