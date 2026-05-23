using ClothingStore.Domain.Enums;
using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record PlaceOrderItem(Guid ProductId, Guid ProductVariantId, int Quantity);

public record PlaceOrderCommand(
    Guid UserId,
    IReadOnlyList<PlaceOrderItem> Items,
    string? CouponCode,
    Guid? ShippingAddressId,
    PaymentMethod PaymentMethod,
    string? Note = null,
    string? IdempotencyKey = null
) : IRequest<Guid>;
