using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Coupons.Queries;

public record GetAvailableCouponsQuery : IRequest<IReadOnlyList<CouponDto>>;

public class GetAvailableCouponsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAvailableCouponsQuery, IReadOnlyList<CouponDto>>
{
    public async Task<IReadOnlyList<CouponDto>> Handle(
        GetAvailableCouponsQuery request,
        CancellationToken ct
    )
    {
        var now = DateTime.UtcNow;
        return await context
            .Coupons.AsNoTracking()
            .Where(c =>
                c.Status == CouponStatus.Active
                && c.ExpiresAt > now
                && (!c.StartsAt.HasValue || c.StartsAt.Value <= now)
                && c.UsedCount < c.MaxUsage
            )
            .OrderBy(c => c.MinOrderSubtotal)
            .ThenByDescending(c => c.DiscountAmount)
            .Select(c => new CouponDto(
                c.Id,
                c.Code,
                c.DiscountType,
                c.DiscountAmount,
                c.MinOrderSubtotal,
                c.MaxUsage,
                c.UsedCount,
                c.StartsAt,
                c.ExpiresAt,
                c.Status,
                c.CreatedAt
            ))
            .ToListAsync(ct);
    }
}
