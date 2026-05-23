using System.Text.Json;
using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Notifications.Queries;

public record GetMyNotificationsQuery(Guid UserId, bool? IsRead, int Page, int PageSize)
    : IRequest<NotificationsResponse>;

public class GetMyNotificationsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMyNotificationsQuery, NotificationsResponse>
{
    public async Task<NotificationsResponse> Handle(
        GetMyNotificationsQuery request,
        CancellationToken ct
    )
    {
        var query = context.Notifications.Where(n => n.UserId == request.UserId);

        if (request.IsRead.HasValue)
        {
            query = query.Where(n => n.IsRead == request.IsRead.Value);
        }

        var totalCount = await query.CountAsync(ct);
        var unreadCount = await context
            .Notifications.Where(n => n.UserId == request.UserId && !n.IsRead)
            .CountAsync(ct);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationDto(
                n.Id,
                n.Title,
                n.Message,
                n.Type.ToString(),
                n.Data != null
                    ? JsonSerializer.Deserialize<object>(n.Data, (JsonSerializerOptions?)null)
                    : null,
                n.IsRead,
                n.CreatedAt,
                n.ReadAt,
                n.RelatedEntityId == null ? null : n.RelatedEntityId.Value.ToString(),
                n.RelatedEntityType
            ))
            .ToListAsync(ct);

        return new NotificationsResponse(notifications, totalCount, unreadCount);
    }
}
