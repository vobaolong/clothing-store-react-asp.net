using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClothingStore.API.Services;

public class UserContext : IUserContext
{
	private readonly IHttpContextAccessor _accessor;

	public UserContext(IHttpContextAccessor accessor) => _accessor = accessor;

	public Guid? GetUserId()
	{
		var user = _accessor.HttpContext?.User;
		if (user == null) return null;

		var claim = user.FindFirstValue(ClaimTypes.NameIdentifier)
								?? user.FindFirstValue(ClaimTypes.Name)
								?? user.FindFirstValue(JwtRegisteredClaimNames.Sub);
		return Guid.TryParse(claim, out var id) ? id : null;
	}

	public Guid GetRequiredUserId()
	{
		var id = GetUserId();
		if (!id.HasValue) throw new UnauthorizedAccessException("Invalid user token.");
		return id.Value;
	}
}
