using ClothingStore.Domain.Enums;

namespace ClothingStore.API.Hubs;

public record RealtimeNotificationDto(
		string Title,
		string Message,
		NotificationType Type,
		object? Data,
		Guid? RelatedEntityId,
		string? RelatedEntityType
);

public record OrderUpdateDto(
		Guid OrderId,
		string NewStatus,
		string UserId
);
