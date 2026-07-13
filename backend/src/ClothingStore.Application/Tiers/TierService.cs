using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;

namespace ClothingStore.Application.Tiers;

public interface ITierService
{
    Task RecalculateTierAsync(User user, CancellationToken ct);
    Task<CustomerTier> CalculateTierAsync(decimal totalSpent, CancellationToken ct);
    void TouchActivity(User user, DateTime? at = null);
    CustomerTier DropOneTier(CustomerTier tier);
}

public class TierService(ITierConfigService configService) : ITierService
{
    public const int TierHoldDays = 365;

    public async Task<CustomerTier> CalculateTierAsync(decimal totalSpent, CancellationToken ct)
    {
        var configs = await configService.GetAllAsync(ct);

        var matched = configs
            .OrderByDescending(c => c.MinSpend)
            .FirstOrDefault(c => totalSpent >= c.MinSpend);

        return matched?.Tier ?? CustomerTier.Bronze;
    }

    public async Task RecalculateTierAsync(User user, CancellationToken ct)
    {
        var newTier = await CalculateTierAsync(user.TotalSpent, ct);

        if (newTier > user.Tier)
            user.Tier = newTier;
    }

    public void TouchActivity(User user, DateTime? at = null)
    {
        user.TierActivityAt = at ?? DateTime.UtcNow;
    }

    public CustomerTier DropOneTier(CustomerTier tier) =>
        tier switch
        {
            CustomerTier.Diamond => CustomerTier.Platinum,
            CustomerTier.Platinum => CustomerTier.Gold,
            CustomerTier.Gold => CustomerTier.Silver,
            CustomerTier.Silver => CustomerTier.Bronze,
            _ => CustomerTier.Bronze,
        };
}
