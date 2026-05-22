using ClothingStore.Domain.Entities;

namespace ClothingStore.Application.Common.Interfaces;

public interface IJwtTokenService
{
	string GenerateToken(User user, bool rememberMe);
}
