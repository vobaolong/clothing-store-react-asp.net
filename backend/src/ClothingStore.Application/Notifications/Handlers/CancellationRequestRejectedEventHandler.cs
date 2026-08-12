using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using ClothingStore.Domain.Events;
using MediatR;

namespace ClothingStore.Application.Notifications.Handlers;

public class CancellationRequestRejectedEventHandler(INotificationService notificationService)
    : INotificationHandler<CancellationRequestRejectedDomainEvent>
{
    public async Task Handle(
        CancellationRequestRejectedDomainEvent notification,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var request = notification.Request;
            var shortId = request.OrderId.ToString("N")[..8].ToUpperInvariant();
            await notificationService.SendToUserAsync(
                request.UserId,
                "Yêu cầu hủy đơn bị từ chối",
                $"Yêu cầu hủy đơn {shortId} của bạn đã bị từ chối. Lý do: {request.RejectionReason}",
                NotificationType.System,
                new { orderId = request.OrderId, requestId = request.Id },
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[CancellationRequestRejectedEventHandler] {ex}");
        }
    }
}
