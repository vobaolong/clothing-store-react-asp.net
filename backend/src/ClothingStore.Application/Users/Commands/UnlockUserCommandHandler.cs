using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Users.Commands;

public class UnlockUserCommandHandler(
    IApplicationDbContext context,
    IEmailTemplateBuilder emailTemplateBuilder,
    IEmailNotificationService emailNotificationService
) : IRequestHandler<UnlockUserCommand>
{
    public async Task Handle(UnlockUserCommand request, CancellationToken cancellationToken)
    {
        var user =
            await context.Users.FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("Customer not found.");

        if (!user.IsLocked)
            return; // Already unlocked, do nothing

        user.IsLocked = false;
        await context.SaveChangesAsync(cancellationToken);

        var emailBody = emailTemplateBuilder.BuildUserUnlockedEmail(user);
        await emailNotificationService.SendSafeAsync(
            user.Email,
            "Your account has been unlocked",
            emailBody
        );
    }
}
