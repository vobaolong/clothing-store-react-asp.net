using AutoMapper;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Reviews;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Reviews.Queries;

public class GetProductReviewsQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetProductReviewsQuery, ProductReviewsDto>
{
    public async Task<ProductReviewsDto> Handle(
        GetProductReviewsQuery request,
        CancellationToken cancellationToken
    )
    {
        var reviewEntities = await context
            .Reviews.AsNoTracking()
            .Include(review => review.User)
            .Where(review => review.ProductId == request.ProductId)
            .OrderByDescending(review => review.CreatedAt)
            .ToListAsync(cancellationToken);

        var reviews = reviewEntities
            .Select(review => mapper.Map<ProductReviewDto>(review))
            .ToList();

        double averageRating = 0d;
        if (reviews.Count > 0)
        {
            averageRating = Math.Round(reviews.Average(x => (double)x.Rating), 1);
        }

        bool canReview = false;
        string? eligibilityMessage = null;

        if (request.CurrentUserId.HasValue)
        {
            var tenDaysAgo = DateTime.UtcNow.AddDays(-10);
            var eligibleOrderItems = await context
                .OrderItems.AsNoTracking()
                .Where(orderItem => orderItem.Order != null)
                .Where(orderItem => orderItem.Order!.UserId == request.CurrentUserId.Value)
                .Where(orderItem => orderItem.ProductId == request.ProductId)
                .Where(orderItem => orderItem.Order!.Status == OrderStatus.Delivered)
                .Select(orderItem => new
                {
                    orderItem.Id,
                    DeliveredAt = orderItem
                        .Order!.StatusHistories.Where(h => h.Status == OrderStatus.Delivered)
                        .OrderByDescending(h => h.ChangedAt)
                        .Select(h => h.ChangedAt)
                        .FirstOrDefault(),
                })
                .Where(orderItem => orderItem.DeliveredAt >= tenDaysAgo)
                .ToListAsync(cancellationToken);

            if (eligibleOrderItems.Count == 0)
            {
                canReview = false;
                eligibilityMessage =
                    "You can only review products after receiving them and within 10 days of receipt.";
            }
            else
            {
                var eligibleOrderItemIds = eligibleOrderItems.Select(x => x.Id).ToList();
                var reviewedOrderItemIds = await context
                    .Reviews.AsNoTracking()
                    .Where(review => review.UserId == request.CurrentUserId.Value)
                    .Where(review => review.ProductId == request.ProductId)
                    .Where(review => review.OrderItemId.HasValue)
                    .Where(review =>
                        review.OrderItem != null
                        && eligibleOrderItemIds.Contains(review.OrderItem.Id)
                    )
                    .Select(review => review.OrderItem!.Id)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                canReview = eligibleOrderItems.Any(orderItem =>
                    !reviewedOrderItemIds.Contains(orderItem.Id)
                );
                eligibilityMessage = canReview
                    ? null
                    : "You have reviewed this product for all eligible order items.";
            }
        }
        else
        {
            canReview = false;
            eligibilityMessage = "Please login to review the product.";
        }

        return new ProductReviewsDto(
            request.ProductId,
            averageRating,
            reviews.Count,
            reviews,
            canReview,
            eligibilityMessage
        );
    }
}
