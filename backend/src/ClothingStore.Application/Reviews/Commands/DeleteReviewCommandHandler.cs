using ClothingStore.Application.Common.Exceptions;
using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Reviews.Commands;

public class DeleteReviewCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteReviewCommand>
{
    public async Task Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var review =
            await context.Reviews.FirstOrDefaultAsync(
                x => x.Id == request.ReviewId,
                cancellationToken
            ) ?? throw new KeyNotFoundException("Review not found.");

        if (review.UserId != request.UserId)
            throw new ForbiddenAccessException("You can only delete your own review.");

        if (DateTime.UtcNow - review.CreatedAt > TimeSpan.FromHours(24))
            throw new InvalidOperationException("Reviews can only be deleted within 24 hours of creation.");

        context.Reviews.Remove(review);
        await context.SaveChangesAsync(cancellationToken);
    }
}
