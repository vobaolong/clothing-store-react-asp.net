using ClothingStore.Domain.Entities;
using MediatR;

namespace ClothingStore.Domain.Events;

public record CancellationRequestCreatedDomainEvent(CancellationRequest Request) : INotification;
