using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Reviews.Queries;

public record GetAdminReviewsQuery(int Page, int PageSize) : IRequest<AdminReviewListResponseDto>;

public class GetAdminReviewsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminReviewsQuery, AdminReviewListResponseDto>
{
    public async Task<AdminReviewListResponseDto> Handle(GetAdminReviewsQuery request, CancellationToken ct)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = context.Reviews
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.Product)
                .ThenInclude(p => p!.Variants)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = items.Select(r => new AdminReviewDto(
            r.Id,
            r.ProductId,
            r.Product?.Name ?? string.Empty,
            r.Product?.Variants.FirstOrDefault()?.ImageUrl ?? string.Empty,
            r.UserId,
            r.User?.Email ?? string.Empty,
            r.User?.FullName ?? string.Empty,
            r.Rating,
            r.Comment,
            string.IsNullOrWhiteSpace(r.Tags) ? Array.Empty<string>() : r.Tags.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries),
            r.CreatedAt
        )).ToList();

        return new AdminReviewListResponseDto(dtos, total);
    }
}
