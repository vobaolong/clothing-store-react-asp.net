using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Auth.Commands;

public class ChangePasswordCommandHandler(
    IApplicationDbContext context,
    IPasswordHasher passwordHasher
) : IRequestHandler<ChangePasswordCommand>
{
    public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user =
            await context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");

        if (!passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Invalid current password.");

        user.PasswordHash = passwordHasher.Hash(request.NewPassword);
        await context.SaveChangesAsync(cancellationToken);
    }
}
