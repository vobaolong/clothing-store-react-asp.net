using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;

namespace ClothingStore.Application.Coupons.Commands;

public record CreateCouponCommand(
    string Code,
    CouponDiscountType DiscountType,
    decimal DiscountAmount,
    decimal MinOrderSubtotal,
    int MaxUsage,
    DateTime ExpiresAt,
    DateTime? StartsAt = null,
    CouponStatus Status = CouponStatus.Active
) : IRequest<Guid>;

public class CreateCouponCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateCouponCommand, Guid>
{
    public async Task<Guid> Handle(CreateCouponCommand request, CancellationToken ct)
    {
        var coupon = new Coupon
        {
            Code = request.Code.Trim().ToUpperInvariant(),
            DiscountType = request.DiscountType,
            DiscountAmount = request.DiscountAmount,
            MinOrderSubtotal = request.MinOrderSubtotal,
            MaxUsage = request.MaxUsage,
            ExpiresAt = request.ExpiresAt,
            StartsAt = request.StartsAt,
            Status = request.Status,
            UsedCount = 0
        };

        context.Coupons.Add(coupon);
        await context.SaveChangesAsync(ct);

        return coupon.Id;
    }
}
