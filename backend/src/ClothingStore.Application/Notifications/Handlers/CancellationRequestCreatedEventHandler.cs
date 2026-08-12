using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using ClothingStore.Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Notifications.Handlers;

public class CancellationRequestCreatedEventHandler(
    IApplicationDbContext context,
    INotificationService notificationService
) : INotificationHandler<CancellationRequestCreatedDomainEvent>
{
    public async Task Handle(
        CancellationRequestCreatedDomainEvent notification,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var request = notification.Request;
            var order = await context.Orders.AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);
            if (order is null) return;

            var shortId = order.Id.ToString("N")[..8].ToUpperInvariant();
            await notificationService.SendToAdminsAsync(
                "Yêu cầu hủy đơn mới",
                $"Khách hàng yêu cầu hủy đơn {shortId}. Vui lòng xem xét.",
                NotificationType.System,
                new { orderId = order.Id, requestId = request.Id, reason = request.Reason },
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[CancellationRequestCreatedEventHandler] {ex}");
        }
    }
}
