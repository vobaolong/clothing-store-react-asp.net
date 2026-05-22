using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Coupons.Commands;

public record UpdateCouponCommand(
    Guid Id,
    string? Code,
    CouponDiscountType? DiscountType,
    decimal? DiscountAmount,
    decimal? MinOrderSubtotal,
    int? MaxUsage,
    DateTime? ExpiresAt,
    DateTime? StartsAt,
    CouponStatus? Status
) : IRequest;

public class UpdateCouponCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateCouponCommand>
{
    public async Task Handle(UpdateCouponCommand request, CancellationToken ct)
    {
        var coupon = await context.Coupons.FirstOrDefaultAsync(c => c.Id == request.Id, ct)
            ?? throw new KeyNotFoundException("Coupon not found.");

        if (request.Code != null)
            coupon.Code = request.Code.Trim().ToUpperInvariant();

        if (request.DiscountType.HasValue)
            coupon.DiscountType = request.DiscountType.Value;

        if (request.DiscountAmount.HasValue)
            coupon.DiscountAmount = request.DiscountAmount.Value;

        if (request.MinOrderSubtotal.HasValue)
            coupon.MinOrderSubtotal = request.MinOrderSubtotal.Value;

        if (request.MaxUsage.HasValue)
            coupon.MaxUsage = request.MaxUsage.Value;

        if (request.ExpiresAt.HasValue)
            coupon.ExpiresAt = request.ExpiresAt.Value;

        if (request.StartsAt.HasValue)
            coupon.StartsAt = request.StartsAt;

        if (request.Status.HasValue)
            coupon.Status = request.Status.Value;

        await context.SaveChangesAsync(ct);
    }
}
