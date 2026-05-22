using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Categories.Queries;

public record GetAdminCategoriesQuery : IRequest<IReadOnlyList<CategoryDto>>;

public class GetAdminCategoriesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    public async Task<IReadOnlyList<CategoryDto>> Handle(GetAdminCategoriesQuery request, CancellationToken ct)
    {
        var data = await context.Categories.AsNoTracking()
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
