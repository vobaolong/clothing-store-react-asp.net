using ClothingStore.Domain.Enums;
using ClothingStore.Domain.Events;

namespace ClothingStore.Domain.Entities;

public class Order : BaseEntity, IAuditableEntity
{
	public Guid UserId { get; set; }
	public User? User { get; set; }
	public decimal TotalAmount { get; set; }
	public OrderStatus Status { get; set; }
	public PaymentMethod PaymentMethod { get; set; }
	public PaymentStatus PaymentStatus { get; set; }
	public DateTime? PaidAt { get; set; }
	public string? PaymentTransactionId { get; set; }
	public Guid? CouponId { get; set; }
	public Coupon? Coupon { get; set; }
	public string? CouponCodeSnapshot { get; set; }
	public CouponDiscountType? CouponDiscountTypeSnapshot { get; set; }
	public decimal? CouponDiscountValueSnapshot { get; set; }
	public decimal DiscountAmount { get; set; }
	public Guid? ShippingAddressId { get; set; }
	public ShippingInfo ShippingInfo { get; set; } = new();
	public string? Note { get; set; }
	public string? IdempotencyKey { get; set; }
	public DateTime UpdatedAt { get; set; }
	public ICollection<OrderItem> Items { get; set; } = [];
	public ICollection<OrderStatusHistory> StatusHistories { get; set; } =
			[];

	public void MarkAsCreated()
	{
		AddDomainEvent(new OrderCreatedDomainEvent(this));
	}

	public void ChangeStatus(OrderStatus newStatus)
	{
		if (!IsValidTransition(Status, newStatus))
			throw new InvalidOperationException(
					$"Invalid status transition: {Status} → {newStatus}.");

		var previousStatus = Status;
		Status = newStatus;
		UpdatedAt = DateTime.UtcNow;
		AddDomainEvent(new OrderStatusChangedDomainEvent(this, previousStatus, newStatus));
	}

	public static bool IsValidTransition(OrderStatus current, OrderStatus next)
	{
		if (current == next) return true;
		return current switch
		{
			OrderStatus.Pending => next is OrderStatus.Confirmed or OrderStatus.Cancelled,
			OrderStatus.Confirmed => next is OrderStatus.Shipping or OrderStatus.Cancelled,
			OrderStatus.Shipping => next is OrderStatus.Delivered or OrderStatus.Cancelled,
			_ => false,
		};
	}
}