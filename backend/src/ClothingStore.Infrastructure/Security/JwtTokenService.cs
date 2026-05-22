using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ClothingStore.Infrastructure.Security;

public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
	public string GenerateToken(User user, bool rememberMe)
	{
		var secret = configuration["Jwt:Secret"];

		if (string.IsNullOrWhiteSpace(secret))
			throw new InvalidOperationException("JWT secret is not configured.");

		var issuer = configuration["Jwt:Issuer"]
				?? "ClothingStore";

		var audience = configuration["Jwt:Audience"]
				?? "ClothingStore.Client";

		var shortExpiryHours = GetIntConfig(
				"Jwt:ShortExpiryHours",
				defaultValue: 1);

		var rememberMeExpiryDays = GetIntConfig(
				"Jwt:RememberMeExpiryDays",
				defaultValue: 7);

		var expiry = rememberMe
				? DateTime.UtcNow.AddDays(rememberMeExpiryDays)
				: DateTime.UtcNow.AddHours(shortExpiryHours);

		var signingKey = new SymmetricSecurityKey(
				Encoding.UTF8.GetBytes(secret));

		var credentials = new SigningCredentials(
				signingKey,
				SecurityAlgorithms.HmacSha256);

		var role = user.IsAdmin ? "Admin" : "Customer";

		var claims = new List<Claim>
				{
						new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
						new(JwtRegisteredClaimNames.Email, user.Email),
						new(ClaimTypes.NameIdentifier, user.Id.ToString()),
						new(ClaimTypes.Email, user.Email),
						new(ClaimTypes.Role, role)
				};

		var token = new JwtSecurityToken(
				issuer: issuer,
				audience: audience,
				claims: claims,
				expires: expiry,
				signingCredentials: credentials);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}

	private int GetIntConfig(string key, int defaultValue)
	{
		return int.TryParse(configuration[key], out var value)
				? value
				: defaultValue;
	}
}