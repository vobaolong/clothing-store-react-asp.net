using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace ClothingStore.Application.Auth.Commands;

public class RegisterUserCommandHandler(
		IApplicationDbContext context,
		IPasswordHasher passwordHasher,
		IEmailTemplateBuilder emailTemplateBuilder,
		IEmailNotificationService emailNotificationService
) : IRequestHandler<RegisterUserCommand, Guid>
{
	public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
	{
		await EnsureEmailIsAvailableAsync(request.Email, cancellationToken);
		ValidatePassword(request.Password);

		var otpCode = GenerateOtpCode();
		var user = CreateUser(request, passwordHasher.Hash(otpCode));

		await context.Users.AddAsync(user, cancellationToken);
		await context.SaveChangesAsync(cancellationToken);

		await SendVerificationEmailAsync(user, otpCode);

		return user.Id;
	}

	private async Task EnsureEmailIsAvailableAsync(string email, CancellationToken cancellationToken)
	{
		var emailTaken = await context.Users
				.AnyAsync(x => x.Email == email, cancellationToken);

		if (emailTaken)
			throw new InvalidOperationException("Email is already in use.");
	}

	private static void ValidatePassword(string password)
	{
		var rules = new (Func<string, bool> Fails, string Message)[]
		{
						(p => p.Length < 8,"Password must be at least 8 characters long."),
						(p => !p.Any(char.IsUpper),"Password must contain at least one uppercase letter."),
						(p => !p.Any(char.IsLower),"Password must contain at least one lowercase letter."),
						(p => !p.Any(char.IsDigit),"Password must contain at least one digit."),
		};

		foreach (var (fails, message) in rules)
			if (fails(password))
				throw new InvalidOperationException(message);
	}

	private static string GenerateOtpCode()
	{
		// Cryptographically secure — avoid new Random() for security-sensitive values
		var value = RandomNumberGenerator.GetInt32(100_000, 1_000_000);
		return value.ToString();
	}

	private User CreateUser(RegisterUserCommand request, string otpHash) => new()
	{
		FullName = request.FullName,
		Email = request.Email,
		Phone = request.Phone,

		PasswordHash = passwordHasher.Hash(request.Password),
		IsAdmin = false,
		IsLocked = false,
		IsEmailVerified = false,

		EmailVerificationOtpHash = otpHash,
		EmailVerificationOtpExpiresAt = DateTime.UtcNow.AddMinutes(5),
	};

	private async Task SendVerificationEmailAsync(User user, string otpCode)
	{
		var body = emailTemplateBuilder.BuildRegisterOtpEmail(user, otpCode);
		await emailNotificationService.SendSafeAsync(
				user.Email,
				"Verify Your Email Address - Clothing Store",
				body
		);
	}
}