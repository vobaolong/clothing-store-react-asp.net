using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using ClothingStore.Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Notifications.Handlers;

public class OrderCreatedEventHandler(
    IApplicationDbContext context,
    INotificationService notificationService
) : INotificationHandler<OrderCreatedDomainEvent>
{
    public async Task Handle(
        OrderCreatedDomainEvent notification,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var order = notification.Order;
            var firstItem = order.Items.FirstOrDefault();
            string? primaryImageUrl = null;
            if (firstItem is not null)
            {
                primaryImageUrl = await context
                    .ProductVariants.Where(v => v.Id == firstItem.ProductVariantId)
                    .Select(v => v.ImageUrl)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            var adminTitle = "Đơn hàng mới";
            var shortId = order.Id.ToString("N")[..8].ToUpperInvariant();
            var adminMessage =
                $"Có đơn hàng mới {shortId} từ khách hàng. Vui lòng xem xét và xử lý.";

            await notificationService.SendToAdminsAsync(
                adminTitle,
                adminMessage,
                NotificationType.OrderCreated,
                new
                {
                    orderId = order.Id,
                    userId = order.UserId,
                    totalAmount = order.TotalAmount,
                    primaryImageUrl,
                },
                cancellationToken
            );
        }
        catch { }
    }
}
