using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;

namespace ClothingStore.Domain.Events;

public record OrderStatusChangedDomainEvent(
		Order Order,
		OrderStatus PreviousStatus,
		OrderStatus NewStatus
) : INotification;