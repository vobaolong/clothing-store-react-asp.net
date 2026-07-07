using System.Security.Cryptography;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ClothingStore.Infrastructure.Security;

public class RememberMeTokenService(ApplicationDbContext context, IConfiguration configuration)
    : IRememberMeTokenService
{
    private int ExpiryDays =>
        int.TryParse(configuration["RememberMe:ExpiryDays"], out var val) ? val : 30;

    public async Task<string> GenerateTokenAsync(User user, CancellationToken cancellationToken)
    {
        var raw = Convert
            .ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=')
            .Replace('/', '_')
            .Replace('+', '-');

        var hash = HashToken(raw);

        context
            .Set<RememberMeToken>()
            .Add(
                new RememberMeToken
                {
                    UserId = user.Id,
                    TokenHash = hash,
                    ExpiresAt = DateTime.UtcNow.AddDays(ExpiryDays),
                }
            );

        await context.SaveChangesAsync(cancellationToken);
        return raw;
    }

    public async Task<User?> ValidateAndRotateAsync(
        string opaqueToken,
        CancellationToken cancellationToken
    )
    {
        var hash = HashToken(opaqueToken);

        var entity = await context
            .Set<RememberMeToken>()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

        if (entity is null || entity.IsUsed || entity.ExpiresAt < DateTime.UtcNow)
            return null;

        // rotate: mark current used, issue a new one (replace in place)
        entity.IsUsed = true;

        var newRaw = Convert
            .ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=')
            .Replace('/', '_')
            .Replace('+', '-');

        var newHash = HashToken(newRaw);

        context
            .Set<RememberMeToken>()
            .Add(
                new RememberMeToken
                {
                    UserId = entity.UserId,
                    TokenHash = newHash,
                    ExpiresAt = DateTime.UtcNow.AddDays(ExpiryDays),
                }
            );

        // stash new token so the caller can return it
        _latestRotation = newRaw;

        await context.SaveChangesAsync(cancellationToken);
        return entity.User;
    }

    // used by the RefreshTokenCommand handler to get the new token after ValidateAndRotateAsync
    public string? ConsumeLatestRotation()
    {
        var val = _latestRotation;
        _latestRotation = null;
        return val;
    }

    public async Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var tokens = await context
            .Set<RememberMeToken>()
            .Where(t => t.UserId == userId && !t.IsUsed)
            .ToListAsync(cancellationToken);

        foreach (var t in tokens)
            t.IsUsed = true;

        await context.SaveChangesAsync(cancellationToken);
    }

    private static string HashToken(string raw) =>
        Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(raw)));

    private string? _latestRotation;
}
