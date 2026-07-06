using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Queries;

public record GetRevenueKpiQuery() : IRequest<RevenueKpiDto>;

public record RevenueKpiDto(
    decimal CurrentRevenue,
    decimal PreviousRevenue,
    decimal Difference,
    decimal? PercentageChange
);

public class GetRevenueKpiQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetRevenueKpiQuery, RevenueKpiDto>
{
    public async Task<RevenueKpiDto> Handle(GetRevenueKpiQuery request, CancellationToken ct)
    {
        // Use UTC boundaries for month calculation
        var now = DateTime.UtcNow;
        var startCurrent = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startNext = startCurrent.AddMonths(1);
        var startPrevious = startCurrent.AddMonths(-1);

        var query = context
            .Orders.AsNoTracking()
            .Where(o =>
                o.PaymentStatus == PaymentStatus.Paid
                && o.Status != OrderStatus.Cancelled
                && o.PaidAt != null
            );

        var aggregated = await query
            .Select(o => new
            {
                Current = o.PaidAt >= startCurrent && o.PaidAt < startNext ? o.TotalAmount : 0m,
                Previous = o.PaidAt >= startPrevious && o.PaidAt < startCurrent
                    ? o.TotalAmount
                    : 0m,
            })
            .GroupBy(x => 0)
            .Select(g => new { Current = g.Sum(x => x.Current), Previous = g.Sum(x => x.Previous) })
            .FirstOrDefaultAsync(ct);

        var current = aggregated?.Current ?? 0m;
        var previous = aggregated?.Previous ?? 0m;
        var diff = current - previous;
        decimal? percent = previous == 0m ? null : Math.Round(diff / previous * 100m, 2);

        return new RevenueKpiDto(current, previous, diff, percent);
    }
}
