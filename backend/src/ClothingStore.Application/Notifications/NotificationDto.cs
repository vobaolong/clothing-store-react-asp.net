namespace ClothingStore.Application.Notifications;

public record NotificationDto(
    Guid Id,
    string Title,
    string Message,
    string Type,
    object? Data,
    bool IsRead,
    DateTime CreatedAt,
    DateTime? ReadAt,
    string? RelatedEntityId,
    string? RelatedEntityType
);

public record NotificationsResponse(
    IReadOnlyList<NotificationDto> Notifications,
    int TotalCount,
    int UnreadCount
);
