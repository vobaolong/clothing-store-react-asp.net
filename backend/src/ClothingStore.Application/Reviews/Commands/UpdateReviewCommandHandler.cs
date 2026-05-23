using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Reviews.Commands;

public class UpdateReviewCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateReviewCommand, ProductReviewDto>
{
    private static IReadOnlyList<string> ParseTags(string? tags)
    {
        if (string.IsNullOrWhiteSpace(tags))
            return Array.Empty<string>();

        return tags.Split(
                ',',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
            )
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .ToArray();
    }

    public async Task<ProductReviewDto> Handle(
        UpdateReviewCommand request,
        CancellationToken cancellationToken
    )
    {
        if (request.Rating < 1 || request.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        var review =
            await context.Reviews.FirstOrDefaultAsync(
                x => x.Id == request.ReviewId,
                cancellationToken
            ) ?? throw new KeyNotFoundException("Review not found.");
        if (review.UserId != request.UserId)
            throw new InvalidOperationException("You can only edit your own review.");

        review.Rating = request.Rating;
        review.Comment = request.Comment?.Trim();
        await context.SaveChangesAsync(cancellationToken);

        var x =
            await context
                .Reviews.AsNoTracking()
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == review.Id, cancellationToken)
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
            x.UpdatedAt,
            x.UserId == request.UserId
        );
    }
}
