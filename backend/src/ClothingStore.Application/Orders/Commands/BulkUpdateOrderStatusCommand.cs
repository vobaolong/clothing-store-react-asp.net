using ClothingStore.Domain.Enums;
using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record BulkUpdateOrderStatusCommand(List<Guid> OrderIds, OrderStatus Status) : IRequest<int>;
