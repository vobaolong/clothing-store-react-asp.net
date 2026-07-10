using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Queries;

public record GetRevenueKpiQuery(string? PeriodType, int? PeriodValue, int? Year)
    : IRequest<RevenueKpiDto>;

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
        var now = DateTime.UtcNow;
        var year = request.Year ?? now.Year;

        DateTime startCurrent,
            startNext,
            startPrevious;

        if (
            string.Equals(request.PeriodType, "quarter", StringComparison.OrdinalIgnoreCase)
            && request.PeriodValue is >= 1 and <= 4
        )
        {
            var startMonth = (request.PeriodValue.Value - 1) * 3 + 1;
            startCurrent = new DateTime(year, startMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            startNext = startCurrent.AddMonths(3);
            startPrevious = startCurrent.AddMonths(-3);
        }
        else if (
            string.Equals(request.PeriodType, "month", StringComparison.OrdinalIgnoreCase)
            && request.PeriodValue is >= 1 and <= 12
        )
        {
            startCurrent = new DateTime(
                year,
                request.PeriodValue.Value,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            );
            startNext = startCurrent.AddMonths(1);
            startPrevious = startCurrent.AddMonths(-1);
        }
        else
        {
            // Default: current month vs last month
            startCurrent = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            startNext = startCurrent.AddMonths(1);
            startPrevious = startCurrent.AddMonths(-1);
        }

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
