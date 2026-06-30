using System.Security.Cryptography;
using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Auth.Commands;

public class ResendRegisterOtpCommandHandler(
    IApplicationDbContext context,
    IPasswordHasher passwordHasher,
    IEmailTemplateBuilder emailTemplateBuilder,
    IEmailNotificationService emailNotificationService
) : IRequestHandler<ResendRegisterOtpCommand, bool>
{
    public async Task<bool> Handle(
        ResendRegisterOtpCommand request,
        CancellationToken cancellationToken
    )
    {
        var user =
            await context.Users.FirstOrDefaultAsync(
                x => x.Email == request.Email,
                cancellationToken
            ) ?? throw new InvalidOperationException("User not found.");
        if (user.IsEmailVerified)
            throw new InvalidOperationException("User is already verified.");

        var otpCode = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var otpHash = passwordHasher.Hash(otpCode);

        user.EmailVerificationOtpHash = otpHash;
        user.EmailVerificationOtpExpiresAt = DateTime.UtcNow.AddMinutes(5);

        await context.SaveChangesAsync(cancellationToken);

        var emailBody = emailTemplateBuilder.BuildRegisterOtpEmail(user, otpCode);
        await emailNotificationService.SendSafeAsync(
            user.Email,
            "Verify Your Email Address - Clothing Store",
            emailBody,
            cancellationToken
        );

        return true;
    }
}
