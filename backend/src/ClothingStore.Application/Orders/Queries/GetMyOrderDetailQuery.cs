using AutoMapper;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Queries;

public record GetMyOrderDetailQuery(Guid UserId, Guid OrderId) : IRequest<OrderDetailDto>;

public class GetMyOrderDetailQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetMyOrderDetailQuery, OrderDetailDto>
{
    public async Task<OrderDetailDto> Handle(GetMyOrderDetailQuery request, CancellationToken ct)
    {
        var order =
            await context
                .Orders.AsNoTracking()
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Items)
                    .ThenInclude(i => i.ProductVariant)
                .Include(o => o.StatusHistories)
                .Where(o => o.UserId == request.UserId && o.Id == request.OrderId)
                .FirstOrDefaultAsync(ct)
            ?? throw new KeyNotFoundException("Order not found.");

        var deliveredAt = order
            .StatusHistories.Where(h => h.Status == OrderStatus.Delivered)
            .OrderByDescending(h => h.ChangedAt)
            .Select(h => (DateTime?)h.ChangedAt)
            .FirstOrDefault();

        var inReviewWindow =
            deliveredAt.HasValue && deliveredAt.Value >= DateTime.UtcNow.AddDays(-10);

        var reviewedOrderItemIds = await context
            .Reviews.AsNoTracking()
            .Where(r =>
                r.UserId == request.UserId && r.OrderItem != null && r.OrderItem.OrderId == order.Id
            )
            .Where(r => r.OrderItemId.HasValue)
            .Select(r => r.OrderItemId!.Value)
            .Distinct()
            .ToListAsync(ct);

        var items = order
            .Items.Select(item =>
            {
                var hasReviewed = reviewedOrderItemIds.Contains(item.Id);
                var canReview =
                    order.Status == OrderStatus.Delivered && inReviewWindow && !hasReviewed;

                return mapper.Map<OrderDetailItemDto>(item) with
                {
                    HasReviewed = hasReviewed,
                    CanReview = canReview,
                };
            })
            .ToList();

        return new OrderDetailDto(
            order.Id,
            order.CreatedAt,
            order.Status,
            order.TotalAmount,
            order.PaymentMethod,
            order.Status == OrderStatus.Delivered ? PaymentStatus.Paid : order.PaymentStatus,
            order.PaidAt,
            order.CouponCodeSnapshot,
            order.CouponDiscountTypeSnapshot,
            order.CouponDiscountValueSnapshot,
            order.DiscountAmount,
            order.ShippingInfo.FullName,
            order.ShippingInfo.Phone,
            order.ShippingInfo.Street,
            order.ShippingInfo.Province,
            order.ShippingInfo.ProvinceId,
            order.ShippingInfo.Ward,
            order.ShippingInfo.WardCode,
            order.ShippingInfo.Street,
            order.ShippingInfo.Label?.ToString(),
            order.Note,
            order.UpdatedAt,
            order
                .StatusHistories.OrderBy(h => h.ChangedAt)
                .Select(h => mapper.Map<OrderStatusHistoryDto>(h))
                .ToList(),
            items
        );
    }
}
