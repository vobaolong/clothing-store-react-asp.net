using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Users.Commands;

public class LockUserCommandHandler(
    IApplicationDbContext context,
    IEmailTemplateBuilder emailTemplateBuilder,
    IEmailNotificationService emailNotificationService
) : IRequestHandler<LockUserCommand>
{
    public async Task Handle(LockUserCommand request, CancellationToken cancellationToken)
    {
        var user =
            await context.Users.FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("Customer not found.");

        if (user.IsAdmin)
            throw new InvalidOperationException("Cannot lock admin account.");

        if (user.IsLocked)
            return; // Already locked, do nothing

        user.IsLocked = true;
        await context.SaveChangesAsync(cancellationToken);

        var emailBody = emailTemplateBuilder.BuildUserLockedEmail(user, request.Reason);
        await emailNotificationService.SendSafeAsync(
            user.Email,
            "Important: Your account has been locked",
            emailBody
        );
    }
}
