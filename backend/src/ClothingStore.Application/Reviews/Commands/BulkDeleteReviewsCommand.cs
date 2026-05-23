using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Reviews.Commands;

public record BulkDeleteReviewsCommand(IReadOnlyList<Guid> Ids) : IRequest<int>;

public class BulkDeleteReviewsCommandHandler(IApplicationDbContext context)
    : IRequestHandler<BulkDeleteReviewsCommand, int>
{
    public async Task<int> Handle(BulkDeleteReviewsCommand request, CancellationToken ct)
    {
        var reviews = await context.Reviews.Where(r => request.Ids.Contains(r.Id)).ToListAsync(ct);

        if (reviews.Count == 0)
            return 0;

        context.Reviews.RemoveRange(reviews);
        await context.SaveChangesAsync(ct);
        return reviews.Count;
    }
}
