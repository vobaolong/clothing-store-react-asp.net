using ClothingStore.Domain.Enums;

namespace ClothingStore.Application.Coupons;

public record CouponDto(
    Guid Id,
    string Code,
    CouponDiscountType DiscountType,
    decimal DiscountAmount,
    decimal MinOrderSubtotal,
    int MaxUsage,
    int UsedCount,
    DateTime? StartsAt,
    DateTime ExpiresAt,
    CouponStatus Status,
    DateTime CreatedAt
);

public record ValidCouponResponseDto(
    Guid CouponId,
    string Code,
    CouponDiscountType DiscountType,
    decimal DiscountAmount
);
