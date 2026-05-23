using ClothingStore.Domain.Enums;

namespace ClothingStore.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public CouponDiscountType DiscountType { get; set; } = CouponDiscountType.Flat;
    public decimal DiscountAmount { get; set; }
    public decimal MinOrderSubtotal { get; set; }
    public int MaxUsage { get; set; }
    public int UsedCount { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public CouponStatus Status { get; set; } = CouponStatus.Active;

    public decimal CalculateDiscountAmount(decimal subtotal) =>
        DiscountType switch
        {
            CouponDiscountType.Percent => Math.Round(
                subtotal * DiscountAmount / 100m,
                0,
                MidpointRounding.AwayFromZero
            ),
            _ => DiscountAmount,
        };
}
