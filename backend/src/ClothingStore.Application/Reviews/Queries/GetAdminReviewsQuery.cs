using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Reviews.Queries;

public record GetAdminReviewsQuery(int Page, int PageSize) : IRequest<AdminReviewListResponseDto>;

public class GetAdminReviewsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminReviewsQuery, AdminReviewListResponseDto>
{
    public async Task<AdminReviewListResponseDto> Handle(
        GetAdminReviewsQuery request,
        CancellationToken ct
    )
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = context
            .Reviews.AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                Review = r,
                FirstVariantImageUrl = context
                    .ProductVariants.Where(v => v.ProductId == r.ProductId)
                    .Select(v => v.ImageUrl)
                    .FirstOrDefault(),
            })
            .ToListAsync(ct);

        var dtos = items
            .Select(x => new AdminReviewDto(
                x.Review.Id,
                x.Review.ProductId,
                x.Review.Product?.Name,
                x.FirstVariantImageUrl,
                x.Review.UserId,
                x.Review.User?.Email,
                x.Review.User?.FullName,
                x.Review.Rating,
                x.Review.Comment,
                string.IsNullOrWhiteSpace(x.Review.Tags)
                    ? Array.Empty<string>()
                    : x.Review.Tags.Split(
                        ',',
                        StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries
                    ),
                x.Review.CreatedAt
            ))
            .ToList();

        return new AdminReviewListResponseDto(dtos, total);
    }
}
