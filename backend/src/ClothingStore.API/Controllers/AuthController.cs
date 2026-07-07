using ClothingStore.API.Services;
using ClothingStore.Application.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/auth")]
public class AuthController(ISender sender, IUserContext userContext) : BaseApiController
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return Ok(result, "Registration completed.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginUserCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return Ok(result, "Login successful.");
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordCommand command,
        CancellationToken ct
    )
    {
        await sender.Send(command, ct);
        return Ok("Reset link sent to email if it exists.");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordCommand command,
        CancellationToken ct
    )
    {
        await sender.Send(command, ct);
        return Ok("Password reset successfully.");
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp(
        VerifyRegisterOtpCommand command,
        CancellationToken ct
    )
    {
        await sender.Send(command, ct);
        return Ok("Email verified successfully. You can now login.");
    }

    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp(
        ResendRegisterOtpCommand command,
        CancellationToken ct
    )
    {
        await sender.Send(command, ct);
        return Ok("A new OTP has been sent to your email.");
    }

    [HttpPost("token/refresh")]
    public async Task<IActionResult> RefreshToken(
        RefreshTokenCommand command,
        CancellationToken ct
    )
    {
        var result = await sender.Send(command, ct);
        return Ok(result, "Token refreshed.");
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        await sender.Send(new LogoutCommand(userId), ct);
        return Ok("Logged out successfully.");
    }
}
