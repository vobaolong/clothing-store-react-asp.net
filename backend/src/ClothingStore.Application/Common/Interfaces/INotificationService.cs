using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;

namespace ClothingStore.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendToUserAsync(
        Guid userId,
        string title,
        string message,
        NotificationType type,
        object? data = null,
        CancellationToken cancellationToken = default
    );
    Task SendToAdminsAsync(
        string title,
        string message,
        NotificationType type,
        object? data = null,
        CancellationToken cancellationToken = default
    );
    Task SaveNotificationAsync(
        Notification notification,
        CancellationToken cancellationToken = default
    );

    Task SendOrderUpdateAsync(
        Guid orderId,
        string newStatus,
        Guid userId,
        CancellationToken cancellationToken = default
    );
}
