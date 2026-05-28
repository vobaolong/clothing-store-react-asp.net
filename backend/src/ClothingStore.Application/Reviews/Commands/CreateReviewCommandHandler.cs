using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Reviews.Commands;

public class CreateReviewCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateReviewCommand, ProductReviewDto>
{
    private static IReadOnlyList<string> ParseTags(string? tags)
    {
        if (string.IsNullOrWhiteSpace(tags))
            return [];

        return tags.Split(
                ',',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
            )
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .ToArray();
    }

    public async Task<ProductReviewDto> Handle(
        CreateReviewCommand request,
        CancellationToken cancellationToken
    )
    {
        if (request.Rating < 1 || request.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        var productExists = await context.Products.AnyAsync(
            x => x.Id == request.ProductId,
            cancellationToken
        );
        if (!productExists)
            throw new KeyNotFoundException("Product not found.");

        var tenDaysAgo = DateTime.UtcNow.AddDays(-10);
        var eligibleOrderItems = await context
            .OrderItems.AsNoTracking()
            .Where(x => x.Order != null)
            .Where(x => x.Order!.UserId == request.UserId)
            .Where(x => x.ProductId == request.ProductId)
            .Where(x => x.Order!.Status == OrderStatus.Delivered)
            .Select(x => new
            {
                x.Id,
                x.OrderId,
                x.ProductVariantId,
                DeliveredAt = x.Order!.StatusHistories.Where(h => h.Status == OrderStatus.Delivered)
                    .OrderByDescending(h => h.ChangedAt)
                    .Select(h => h.ChangedAt)
                    .FirstOrDefault(),
            })
            .Where(x => x.DeliveredAt >= tenDaysAgo)
            .OrderByDescending(x => x.DeliveredAt)
            .ToListAsync(cancellationToken);

        if (eligibleOrderItems.Count == 0)
            throw new InvalidOperationException(
                "Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận hàng và trong vòng 10 ngày kể từ lúc nhận."
            );

        var reviewedOrderItemIds = await context
            .Reviews.AsNoTracking()
            .Where(x => x.UserId == request.UserId)
            .Where(x => x.ProductId == request.ProductId)
            .Where(x => x.OrderItemId.HasValue)
            .Select(x => x.OrderItemId!.Value)
            .Distinct()
            .ToListAsync(cancellationToken);

        var availableOrderItems = eligibleOrderItems
            .Where(x => !reviewedOrderItemIds.Contains(x.Id))
            .ToList();

        var targetOrderItem =
            (
                request.OrderItemId.HasValue
                    ? availableOrderItems.FirstOrDefault(x => x.Id == request.OrderItemId.Value)
                    : availableOrderItems.FirstOrDefault()
            )
            ?? throw new InvalidOperationException(
                "Không tìm thấy mục đơn hàng hợp lệ để đánh giá."
            );

        string? variantSize = null;
        string? variantColor = null;

        if (targetOrderItem.ProductVariantId != Guid.Empty)
        {
            var variant = await context.ProductVariants.FirstOrDefaultAsync(
                v => v.Id == targetOrderItem.ProductVariantId,
                cancellationToken
            );
            if (variant != null)
            {
                variantSize = variant.Size;
                variantColor = variant.Color;
            }
        }

        var review = new Review
        {
            UserId = request.UserId,
            ProductId = request.ProductId,
            OrderItemId = targetOrderItem.Id,
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            Tags = request.Tags is { Count: > 0 }
                ? string.Join(
                    ", ",
                    request
                        .Tags.Where(tag => !string.IsNullOrWhiteSpace(tag))
                        .Select(tag => tag.Trim())
                )
                : null,
            VariantSize = variantSize,
            VariantColor = variantColor,
        };
        await context.Reviews.AddAsync(review, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var product = await context.Products.FirstOrDefaultAsync(
            x => x.Id == request.ProductId,
            cancellationToken
        );
        if (product != null)
        {
            var stats = await context
                .Reviews.Where(x => x.ProductId == request.ProductId)
                .GroupBy(x => x.ProductId)
                .Select(g => new { Count = g.Count(), Avg = g.Average(r => (double)r.Rating) })
                .FirstOrDefaultAsync(cancellationToken);

            if (stats != null)
            {
                product.ReviewCount = stats.Count;
                product.AverageRating = Math.Round(stats.Avg, 1);
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        return await GetReviewAsync(review.Id, request.UserId, cancellationToken);
    }

    private async Task<ProductReviewDto> GetReviewAsync(
        Guid reviewId,
        Guid currentUserId,
        CancellationToken cancellationToken
    )
    {
        var x =
            await context
                .Reviews.AsNoTracking()
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == reviewId, cancellationToken)
            ?? throw new KeyNotFoundException();

        return new ProductReviewDto(
            x.Id,
            x.UserId,
            x.User != null ? x.User.FullName : string.Empty,
            x.Rating,
            x.Comment,
            ParseTags(x.Tags),
            x.VariantSize,
            x.VariantColor,
            x.CreatedAt,
            x.UpdatedAt
        );
    }
}
