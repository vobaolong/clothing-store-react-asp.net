using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Notifications.Queries;

public record GetUnreadNotificationsCountQuery(Guid UserId) : IRequest<int>;

public class GetUnreadNotificationsCountQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetUnreadNotificationsCountQuery, int>
{
    public async Task<int> Handle(GetUnreadNotificationsCountQuery request, CancellationToken ct)
    {
        return await context
            .Notifications.Where(n => n.UserId == request.UserId && !n.IsRead)
            .CountAsync(ct);
    }
}
