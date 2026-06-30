using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using ClothingStore.Domain.Events;
using MediatR;

namespace ClothingStore.Application.Notifications.Handlers;

public class OrderStatusChangedEventHandler(INotificationService notificationService)
    : INotificationHandler<OrderStatusChangedDomainEvent>
{
    public async Task Handle(
        OrderStatusChangedDomainEvent notification,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var order = notification.Order;
            var newStatus = notification.NewStatus;

            var (customerTitle, customerMessage, notificationType) = GetCustomerContent(
                order.Id,
                newStatus
            );

            var orderData = new { orderId = order.Id, status = newStatus.ToString() };

            // Notify customer
            await notificationService.SendToUserAsync(
                order.UserId,
                customerTitle,
                customerMessage,
                notificationType,
                orderData,
                cancellationToken
            );

            await notificationService.SendOrderUpdateAsync(
                order.Id,
                newStatus.ToString(),
                order.UserId,
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[OrderStatusChangedEventHandler] {ex}");
        }
    }

    private static (string title, string message, NotificationType type) GetCustomerContent(
        Guid orderId,
        OrderStatus status
    )
    {
        var shortId = orderId.ToString("N")[..8].ToUpperInvariant();
        return status switch
        {
            OrderStatus.Confirmed => (
                "Đơn hàng đã được xác nhận",
                $"Đơn hàng {shortId} của bạn đã được xác nhận và đang được chuẩn bị.",
                NotificationType.OrderConfirmed
            ),
            OrderStatus.Shipping => (
                "Đơn hàng đang được giao",
                $"Đơn hàng {shortId} của bạn đang trên đường giao đến bạn.",
                NotificationType.OrderShipping
            ),
            OrderStatus.Delivered => (
                "Giao kiện hàng thành công",
                $"Đơn hàng {shortId} của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!",
                NotificationType.OrderDelivered
            ),
            OrderStatus.Cancelled => (
                "Đơn hàng đã bị hủy",
                $"Đơn hàng {shortId} của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.",
                NotificationType.OrderCancelled
            ),
            _ => (
                "Cập nhật đơn hàng",
                $"Trạng thái đơn hàng #{shortId} đã được cập nhật.",
                NotificationType.System
            ),
        };
    }
}
