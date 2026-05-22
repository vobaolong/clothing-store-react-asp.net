using ClothingStore.Application.Auth.Commands;
using ClothingStore.Application.Users.Commands;
using ClothingStore.Application.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClothingStore.API.Services;

namespace ClothingStore.API.Controllers;

[Route("api/profile")]
[Authorize]
public class ProfileController(ISender sender, IUserContext userContext) : BaseApiController
{
	[HttpGet("me")]
	public async Task<IActionResult> GetMyProfile(CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		var result = await sender.Send(new GetMyProfileQuery(userId), ct);
		return Ok(result, "Profile fetched.");
	}

	[HttpPut("me")]
	public async Task<IActionResult> UpdateMyProfile(UpdateProfileRequest request, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		await sender.Send(new UpdateMyProfileCommand(userId, request.FullName ?? string.Empty, request.Phone ?? string.Empty), ct);
		return Ok("Profile updated.");
	}

	[HttpPost("change-password")]
	public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		await sender.Send(new ChangePasswordCommand(userId, request.CurrentPassword, request.NewPassword), ct);
		return Ok("Password changed successfully.");
	}
}

public record UpdateProfileRequest(string? FullName, string? Phone);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);