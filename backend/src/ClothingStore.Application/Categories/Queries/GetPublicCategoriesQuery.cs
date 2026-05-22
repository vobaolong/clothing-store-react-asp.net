using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Categories.Queries;

public record GetPublicCategoriesQuery : IRequest<IReadOnlyList<CategoryDto>>;

public class GetPublicCategoriesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPublicCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    public async Task<IReadOnlyList<CategoryDto>> Handle(GetPublicCategoriesQuery request, CancellationToken ct)
    {
        var data = await context.Categories.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CategoryDto(
                x.Id,
                x.Name,
                x.Slug,
                x.Image,
                x.Description,
                x.ParentId,
                x.Level,
                x.Gender.ToString().ToLowerInvariant(),
                x.ProductType.HasValue ? x.ProductType.Value.ToString().ToLowerInvariant() : null,
                x.IsActive,
                x.CreatedAt,
                x.UpdatedAt
            ))
            .ToListAsync(ct);
        return data;
    }
}
