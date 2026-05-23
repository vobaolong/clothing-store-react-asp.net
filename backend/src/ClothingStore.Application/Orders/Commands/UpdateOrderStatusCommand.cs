using ClothingStore.Domain.Enums;
using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record UpdateOrderStatusCommand(Guid OrderId, OrderStatus Status) : IRequest;
