using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Coupons.Queries;

public record GetAdminCouponsQuery(CouponStatus? Status = null)
    : IRequest<IReadOnlyList<CouponDto>>;

public class GetAdminCouponsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminCouponsQuery, IReadOnlyList<CouponDto>>
{
    public async Task<IReadOnlyList<CouponDto>> Handle(
        GetAdminCouponsQuery request,
        CancellationToken ct
    )
    {
        var query = context.Coupons.AsNoTracking();

        if (request.Status.HasValue)
        {
            query = query.Where(c => c.Status == request.Status.Value);
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
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
