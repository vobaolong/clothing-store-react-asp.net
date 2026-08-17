using ClothingStore.Domain.Enums;

namespace ClothingStore.Application.Orders;

public record OrderSummaryDto(
    Guid Id,
    decimal TotalAmount,
    OrderStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    string? Note,
    decimal DiscountAmount,
    int ItemCount,
    IReadOnlyList<OrderItemSummaryDto> Items,
    string? UserEmail = null
);

public record OrderItemSummaryDto(Guid ProductId, int Quantity, decimal UnitPrice);

public record OrderDetailDto(
    Guid Id,
    DateTime CreatedAt,
    OrderStatus Status,
    decimal TotalAmount,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    DateTime? PaidAt,
    string? CouponCodeSnapshot,
    CouponDiscountType? CouponDiscountTypeSnapshot,
    decimal? CouponDiscountValueSnapshot,
    decimal DiscountAmount,
    string ShippingName,
    string ShippingPhone,
    string ShippingAddress,
    string? ShippingProvince,
    string? ShippingProvinceId,
    string? ShippingWard,
    string? ShippingWardCode,
    string? ShippingStreet,
    string? ShippingLabel,
    string? Note,
    DateTime UpdatedAt,
    IReadOnlyList<OrderStatusHistoryDto> StatusHistories,
    IReadOnlyList<OrderDetailItemDto> Items,
    string? UserName = null, // For Admin view
    string? UserEmail = null, // For Admin view
    CancellationRequestDto? CancellationRequest = null
);

public record CancellationRequestDto(
    Guid Id,
    string Reason,
    string? Note,
    CancellationRequestStatus Status,
    DateTime CreatedAt,
    DateTime? ReviewedAt,
    string? RejectionReason
);

public record OrderStatusHistoryDto(OrderStatus Status, DateTime ChangedAt);

public record OrderDetailItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    Guid? ProductVariantId,
    string ProductSlug,
    string? VariantSize,
    string? VariantColor,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal,
    bool? HasReviewed = null,
    bool? CanReview = null,
    string? ImageUrl = null
);

public record OrderStatusCountDto(OrderStatus Status, int Count);

public record MyOrdersResponseDto(
    IReadOnlyList<OrderSummaryDto> Orders,
    IReadOnlyList<OrderStatusCountDto> Counts
);

public record AdminOrdersResponseDto(
    IReadOnlyList<OrderSummaryDto> Orders,
    IReadOnlyList<OrderStatusCountDto> Counts
);
