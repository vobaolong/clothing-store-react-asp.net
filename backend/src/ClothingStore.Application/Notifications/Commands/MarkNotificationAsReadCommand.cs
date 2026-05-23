using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Notifications.Commands;

public record MarkNotificationAsReadCommand(Guid UserId, Guid? NotificationId) : IRequest;

public class MarkNotificationAsReadCommandHandler(IApplicationDbContext context)
    : IRequestHandler<MarkNotificationAsReadCommand>
{
    public async Task Handle(MarkNotificationAsReadCommand request, CancellationToken ct)
    {
        if (request.NotificationId.HasValue)
        {
            var notification =
                await context.Notifications.FirstOrDefaultAsync(
                    n => n.Id == request.NotificationId && n.UserId == request.UserId,
                    ct
                ) ?? throw new KeyNotFoundException("Notification not found.");

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await context.SaveChangesAsync(ct);
            }
        }
        else
        {
            // Mark all as read
            await context
                .Notifications.Where(n => n.UserId == request.UserId && !n.IsRead)
                .ExecuteUpdateAsync(
                    n =>
                        n.SetProperty(x => x.IsRead, true)
                            .SetProperty(x => x.ReadAt, DateTime.UtcNow),
                    ct
                );
        }
    }
}
