using System.Text.Json;
using ClothingStore.API.Hubs;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.API.Services;

public class NotificationService(
    IHubContext<NotificationHub, INotificationClient> hubContext,
    IConnectionManager connectionManager,
    IServiceScopeFactory scopeFactory
) : INotificationService
{
    public async Task SendToUserAsync(
        Guid userId,
        string title,
        string message,
        NotificationType type,
        object? data = null,
        CancellationToken cancellationToken = default
    )
    {
        var notification = BuildNotification(userId, title, message, type, data);
        await PersistAsync(notification, cancellationToken);

        var connections = await connectionManager.GetUserConnectionsAsync(userId);
        if (connections.Count > 0)
        {
            await hubContext
                .Clients.Clients(connections)
                .ReceiveNotification(ToDto(notification, data));
        }
    }

    public async Task SendToAdminsAsync(
        string title,
        string message,
        NotificationType type,
        object? data = null,
        CancellationToken cancellationToken = default
    )
    {
        List<Guid> adminIds;
        await using (var scope = scopeFactory.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            adminIds = await db
                .Users.Where(u => u.IsAdmin)
                .Select(u => u.Id)
                .ToListAsync(cancellationToken);
        }

        if (adminIds.Count == 0)
            return;

        var notifications = adminIds
            .Select(id => BuildNotification(id, title, message, type, data))
            .ToList();

        await PersistManyAsync(notifications, cancellationToken);

        await hubContext.Clients.Group("Admins").ReceiveNotification(ToDto(notifications[0], data));
    }

    public async Task SaveNotificationAsync(
        Notification notification,
        CancellationToken cancellationToken = default
    )
    {
        await PersistAsync(notification, cancellationToken);
    }

    public async Task SendOrderUpdateAsync(
        Guid orderId,
        string newStatus,
        Guid userId,
        CancellationToken cancellationToken = default
    )
    {
        var dto = new OrderUpdateDto(orderId, newStatus, userId.ToString());

        var userConnections = await connectionManager.GetUserConnectionsAsync(userId);
        if (userConnections.Count > 0)
        {
            await hubContext.Clients.Clients(userConnections).ReceiveOrderUpdate(dto);
        }

        await hubContext.Clients.Group("Admins").ReceiveOrderUpdate(dto);
    }

    private static Notification BuildNotification(
        Guid userId,
        string title,
        string message,
        NotificationType type,
        object? data
    )
    {
        return new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            Data = data != null ? JsonSerializer.Serialize(data) : null,
            IsRead = false,
            RelatedEntityId = ExtractOrderId(data),
            RelatedEntityType = ExtractOrderId(data).HasValue ? "Order" : null,
        };
    }

    private static RealtimeNotificationDto ToDto(Notification n, object? data) =>
        new(n.Title, n.Message, n.Type, data, n.RelatedEntityId, n.RelatedEntityType);

    private async Task PersistAsync(Notification notification, CancellationToken ct)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        db.Notifications.Add(notification);
        await db.SaveChangesAsync(ct);
    }

    private async Task PersistManyAsync(List<Notification> notifications, CancellationToken ct)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        db.Notifications.AddRange(notifications);
        await db.SaveChangesAsync(ct);
    }

    private static Guid? ExtractOrderId(object? data)
    {
        if (data == null)
            return null;
        try
        {
            var json = JsonSerializer.Serialize(data);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("orderId", out var el) && el.TryGetGuid(out var id))
                return id;
        }
        catch { }
        return null;
    }
}
