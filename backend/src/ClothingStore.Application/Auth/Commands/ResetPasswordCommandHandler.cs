using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Auth.Commands;

public class ResetPasswordCommandHandler(
    IApplicationDbContext context,
    IPasswordHasher passwordHasher
) : IRequestHandler<ResetPasswordCommand>
{
    public async Task Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users.FirstOrDefaultAsync(
            u => u.Email == request.Email && u.ResetPasswordToken == request.Token,
            cancellationToken
        );

        if (user == null || user.ResetPasswordTokenExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("Invalid or expired token.");

        user.PasswordHash = passwordHasher.Hash(request.NewPassword);
        user.ResetPasswordToken = null;
        user.ResetPasswordTokenExpiresAt = null;

        await context.SaveChangesAsync(cancellationToken);
    }
}
