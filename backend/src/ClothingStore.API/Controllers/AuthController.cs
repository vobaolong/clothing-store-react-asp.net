using ClothingStore.Application.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/auth")]
public class AuthController(ISender sender) : BaseApiController
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
        var token = await sender.Send(command, ct);
        return Ok(token, "Login successful.");
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
}
