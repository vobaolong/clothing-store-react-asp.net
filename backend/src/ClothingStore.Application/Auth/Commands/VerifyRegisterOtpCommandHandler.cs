using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Auth.Commands;

public class VerifyRegisterOtpCommandHandler(
    IApplicationDbContext context,
    IPasswordHasher passwordHasher
) : IRequestHandler<VerifyRegisterOtpCommand, bool>
{
    public async Task<bool> Handle(
        VerifyRegisterOtpCommand request,
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

        if (string.IsNullOrEmpty(user.EmailVerificationOtpHash))
            throw new InvalidOperationException("No OTP found for this user.");

        if (user.EmailVerificationOtpExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("OTP has expired.");

        if (!passwordHasher.Verify(request.OtpCode, user.EmailVerificationOtpHash))
            throw new InvalidOperationException("Invalid OTP code.");

        user.IsEmailVerified = true;
        user.EmailVerificationOtpHash = null;
        user.EmailVerificationOtpExpiresAt = null;

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
