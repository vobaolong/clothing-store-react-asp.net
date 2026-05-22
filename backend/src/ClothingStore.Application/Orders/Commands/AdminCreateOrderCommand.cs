using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public record AdminCreateOrderItem(
		Guid ProductId,
		Guid ProductVariantId,
		int Quantity,
		decimal UnitPrice
);

public record AdminCreateOrderCommand(
		Guid UserId,
		decimal TotalAmount,
		OrderStatus Status,
		IReadOnlyList<AdminCreateOrderItem> Items
) : IRequest<Guid>;

public class AdminCreateOrderCommandHandler(IApplicationDbContext context)
		: IRequestHandler<AdminCreateOrderCommand, Guid>
{
	public async Task<Guid> Handle(AdminCreateOrderCommand request, CancellationToken ct)
	{
		var productIds = request.Items.Select(x => x.ProductId).Distinct().ToList();
		var products = await context.Products
				.Where(x => productIds.Contains(x.Id))
				.ToDictionaryAsync(x => x.Id, ct);

		var variantIds = request.Items.Select(x => x.ProductVariantId).Distinct().ToList();
		var variants = await context.ProductVariants
				.Where(x => variantIds.Contains(x.Id))
				.ToDictionaryAsync(x => x.Id, ct);

		var order = new Order
		{
			UserId = request.UserId,
			TotalAmount = request.TotalAmount,
			Status = request.Status,
			PaymentMethod = PaymentMethod.COD,
			PaymentStatus = PaymentStatus.Unpaid,
			ShippingInfo = new ShippingInfo(),
			Items = request.Items.Select(x =>
			{
				products.TryGetValue(x.ProductId, out var product);
				variants.TryGetValue(x.ProductVariantId, out var variant);
				return new OrderItem
				{
					ProductId = x.ProductId,
					ProductName = product?.Name ?? string.Empty,
					ProductVariantId = x.ProductVariantId,
					VariantName = variant != null ? $"{variant.Size} - {variant.Color}" : null,
					Quantity = x.Quantity,
					UnitPrice = x.UnitPrice,
				};
			}).ToList(),
		};

		order.StatusHistories.Add(new OrderStatusHistory { Status = order.Status, ChangedAt = DateTime.UtcNow });

		await context.Orders.AddAsync(order, ct);
		await context.SaveChangesAsync(ct);
		return order.Id;
	}
}
