using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Coupons.Queries;

public record ValidateCouponQuery(string Code, decimal OrderTotal) : IRequest<ValidCouponResponseDto>;

public class ValidateCouponQueryHandler(IApplicationDbContext context)
    : IRequestHandler<ValidateCouponQuery, ValidCouponResponseDto>
{
    public async Task<ValidCouponResponseDto> Handle(ValidateCouponQuery request, CancellationToken ct)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var coupon = await context.Coupons.FirstOrDefaultAsync(c => c.Code == code, ct)
            ?? throw new InvalidOperationException("Coupon is invalid.");

        if (coupon.Status != CouponStatus.Active)
            throw new InvalidOperationException("Coupon is not active.");

        var nowUtc = DateTime.UtcNow;
        if (coupon.StartsAt.HasValue && coupon.StartsAt.Value > nowUtc)
            throw new InvalidOperationException("Coupon is not active yet.");

        if (coupon.ExpiresAt <= nowUtc)
            throw new InvalidOperationException("Coupon is expired.");

        if (coupon.UsedCount >= coupon.MaxUsage)
            throw new InvalidOperationException("Coupon usage limit reached.");

        if (request.OrderTotal < coupon.MinOrderSubtotal)
            throw new InvalidOperationException("Order does not meet minimum subtotal.");

        var discountAmount = coupon.CalculateDiscountAmount(request.OrderTotal);
        if (discountAmount > request.OrderTotal)
            throw new InvalidOperationException("Coupon is not applicable.");

        return new ValidCouponResponseDto(coupon.Id, coupon.Code, coupon.DiscountType, discountAmount);
    }
}
