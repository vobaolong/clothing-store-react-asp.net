using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Coupons.Commands;

public record DeleteCouponCommand(Guid Id) : IRequest;

public class DeleteCouponCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteCouponCommand>
{
    public async Task Handle(DeleteCouponCommand request, CancellationToken ct)
    {
        var coupon = await context.Coupons.FirstOrDefaultAsync(c => c.Id == request.Id, ct)
            ?? throw new KeyNotFoundException("Coupon not found.");

        var hasOrders = await context.Orders.AnyAsync(o => o.CouponId == request.Id, ct);

        if (hasOrders || coupon.UsedCount > 0)
        {
            coupon.Status = CouponStatus.Archived;
        }
        else
        {
            context.Coupons.Remove(coupon);
        }

        await context.SaveChangesAsync(ct);
    }
}
