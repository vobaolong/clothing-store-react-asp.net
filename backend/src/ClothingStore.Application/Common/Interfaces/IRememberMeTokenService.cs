using ClothingStore.Domain.Entities;

namespace ClothingStore.Application.Common.Interfaces;

public interface IRememberMeTokenService
{
    Task<string> GenerateTokenAsync(User user, CancellationToken cancellationToken);
    Task<User?> ValidateAndRotateAsync(string opaqueToken, CancellationToken cancellationToken);
    Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken);
}
