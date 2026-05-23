using ClothingStore.Domain.Entities;
using MediatR;

namespace ClothingStore.Domain.Events;

public record OrderCreatedDomainEvent(Order Order) : INotification;
