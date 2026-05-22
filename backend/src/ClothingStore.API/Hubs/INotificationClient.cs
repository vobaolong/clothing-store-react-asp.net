namespace ClothingStore.API.Hubs;

public interface INotificationClient
{
	Task ReceiveNotification(RealtimeNotificationDto notification);
	Task ReceiveOrderUpdate(OrderUpdateDto orderUpdate);
	Task ReceiveSystemMessage(string message);
}