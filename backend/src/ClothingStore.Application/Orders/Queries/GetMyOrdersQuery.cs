using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Queries;

public record GetMyOrdersQuery(Guid UserId, string? Status) : IRequest<MyOrdersResponseDto>;

public class GetMyOrdersQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMyOrdersQuery, MyOrdersResponseDto>
{
    public async Task<MyOrdersResponseDto> Handle(GetMyOrdersQuery request, CancellationToken ct)
    {
        var query = context
            .Orders.AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == request.UserId);

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
                null
            ))
            .ToListAsync(ct);

        var counts = await context
            .Orders.AsNoTracking()
            .Where(o => o.UserId == request.UserId)
            .GroupBy(o => o.Status)
            .Select(g => new OrderStatusCountDto(g.Key, g.Count()))
            .ToListAsync(ct);

        return new MyOrdersResponseDto(orders, counts);
    }
}
