using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Tiers.Queries;

public record GetMyTierQuery(Guid UserId) : IRequest<MyTierDto>;

public record MyTierDto(
    CustomerTier CurrentTier,
    decimal TotalSpent,
    decimal NextThreshold,
    string? NextTierName,
    decimal ProgressPercent,
    decimal DiscountPercent,
    bool FreeShipping
);

public class GetMyTierQueryHandler(IApplicationDbContext context, ITierConfigService configService)
    : IRequestHandler<GetMyTierQuery, MyTierDto>
{
    public async Task<MyTierDto> Handle(GetMyTierQuery request, CancellationToken ct)
    {
        var user =
            await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == request.UserId, ct)
            ?? throw new InvalidOperationException("User not found.");

        var configs = await configService.GetAllAsync(ct);
        var currentTier = user.Tier;
        var totalSpent = user.TotalSpent;

        var currentConfig = configs.First(c => c.Tier == currentTier);
        var nextConfig = configs.FirstOrDefault(c => c.Tier > currentTier);

        var nextThreshold = nextConfig?.MinSpend ?? currentConfig.MinSpend;
        var progressPercent =
            nextConfig != null && nextConfig.MinSpend > currentConfig.MinSpend
                ? Math.Min(
                    100m,
                    (totalSpent - currentConfig.MinSpend)
                        / (nextConfig.MinSpend - currentConfig.MinSpend)
                        * 100m
                )
                : 100m;

        return new MyTierDto(
            currentTier,
            totalSpent,
            nextThreshold,
            nextConfig?.Tier.ToString(),
            Math.Round(progressPercent, 1),
            currentConfig.DiscountPercent,
            currentConfig.FreeShipping
        );
    }
}
