using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Tiers;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ClothingStore.Infrastructure.Security;

public sealed class TierExpiryBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<TierExpiryBackgroundService> logger
) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);
    private static readonly TimeSpan StartupDelay = TimeSpan.FromMinutes(2);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await Task.Delay(StartupDelay, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunOnceAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Tier expiry job failed");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task RunOnceAsync(CancellationToken ct)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var tierService = scope.ServiceProvider.GetRequiredService<ITierService>();

        var cutoff = DateTime.UtcNow.AddDays(-TierService.TierHoldDays);
        var staleUsers = await context
            .Users.Where(u =>
                !u.IsAdmin
                && u.Tier != CustomerTier.Bronze
                && (u.TierActivityAt == null || u.TierActivityAt < cutoff)
            )
            .ToListAsync(ct);

        if (staleUsers.Count == 0)
            return;

        var now = DateTime.UtcNow;
        foreach (var user in staleUsers)
        {
            var from = user.Tier;
            var to = tierService.DropOneTier(from);
            if (to == from)
                continue;

            user.Tier = to;
            user.TierActivityAt = now;

            context.CustomerTierChangeLogs.Add(
                new CustomerTierChangeLog
                {
                    CustomerId = user.Id,
                    ChangedById = null,
                    FromTier = from,
                    ToTier = to,
                    Reason = "Auto: no order for 1 year",
                }
            );
        }

        await context.SaveChangesAsync(ct);
        logger.LogInformation("Tier expiry: downgraded {Count} user(s)", staleUsers.Count);
    }
}
