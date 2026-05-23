using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Categories.Commands;

public record BulkSetActiveCategoriesCommand(IReadOnlyList<Guid> Ids, bool IsActive)
    : IRequest<int>;

public class BulkSetActiveCategoriesCommandHandler(IApplicationDbContext context)
    : IRequestHandler<BulkSetActiveCategoriesCommand, int>
{
    public async Task<int> Handle(BulkSetActiveCategoriesCommand request, CancellationToken ct)
    {
        if (request.Ids.Count == 0)
            return 0;

        var categories = await context
            .Categories.Where(c => request.Ids.Contains(c.Id))
            .ToListAsync(ct);

        foreach (var category in categories)
            category.IsActive = request.IsActive;

        await context.SaveChangesAsync(ct);
        return categories.Count;
    }
}
