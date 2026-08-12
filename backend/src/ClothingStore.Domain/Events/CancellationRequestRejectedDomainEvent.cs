using ClothingStore.Domain.Entities;
using MediatR;

namespace ClothingStore.Domain.Events;

public record CancellationRequestRejectedDomainEvent(CancellationRequest Request) : INotification;
