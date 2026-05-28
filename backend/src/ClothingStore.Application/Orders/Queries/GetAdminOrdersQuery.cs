using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Queries;

public record GetAdminOrdersQuery(string? Status) : IRequest<AdminOrdersResponseDto>;

public class GetAdminOrdersQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminOrdersQuery, AdminOrdersResponseDto>
{
    public async Task<AdminOrdersResponseDto> Handle(
        GetAdminOrdersQuery request,
        CancellationToken ct
    )
    {
        IQueryable<Order> query = context
            .Orders.AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Items);

        if (
            !string.IsNullOrWhiteSpace(request.Status)
            && !string.Equals(request.Status, "All", StringComparison.OrdinalIgnoreCase)
            && Enum.TryParse<OrderStatus>(request.Status, true, out var statusFilter)
        )
        {
            query = query.Where(o => o.Status == statusFilter);
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.TotalAmount,
                o.Status,
                o.CreatedAt,
                o.UpdatedAt,
                o.PaymentMethod,
                o.Status == OrderStatus.Delivered ? PaymentStatus.Paid : o.PaymentStatus,
                o.Note,
                o.DiscountAmount,
                o.Items.Count,
                o.Items.Select(i => new OrderItemSummaryDto(i.ProductId, i.Quantity, i.UnitPrice))
                    .ToList(),
                o.User != null ? o.User.Email : string.Empty
            ))
            .ToListAsync(ct);

        var counts = await context
            .Orders.AsNoTracking()
            .GroupBy(o => o.Status)
            .Select(g => new OrderStatusCountDto(g.Key, g.Count()))
            .ToListAsync(ct);

        return new AdminOrdersResponseDto(orders, counts);
    }
}
