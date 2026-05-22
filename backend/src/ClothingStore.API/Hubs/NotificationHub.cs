using System.Security.Claims;
using ClothingStore.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ClothingStore.API.Hubs;

[Authorize]
public class NotificationHub(
		IConnectionManager connectionManager
) : Hub<INotificationClient>
{
	public override async Task OnConnectedAsync()
	{

		var userId = GetUserId();
		var isAdmin = IsAdmin();

		if (userId.HasValue)
		{
			await connectionManager.AddConnectionAsync(userId.Value, Context.ConnectionId, isAdmin);

			if (isAdmin)
			{
				await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
			}
			else
			{
				await Groups.AddToGroupAsync(Context.ConnectionId, "Customers");
			}
		}
		await base.OnConnectedAsync();
	}

	public override async Task OnDisconnectedAsync(Exception? exception)
	{
		var userId = GetUserId();

		if (userId.HasValue)
		{
			await connectionManager.RemoveConnectionAsync(userId.Value, Context.ConnectionId);
		}

		await base.OnDisconnectedAsync(exception);
	}

	public async Task JoinGroup(string groupName)
	{
		await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
	}

	public async Task LeaveGroup(string groupName)
	{
		await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
	}

	private Guid? GetUserId()
	{
		var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
	}

	private bool IsAdmin()
	{
		return Context.User?.IsInRole("Admin") ?? false;
	}
}