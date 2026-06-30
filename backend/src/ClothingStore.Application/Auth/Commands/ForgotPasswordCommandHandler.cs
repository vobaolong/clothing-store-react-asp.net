using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ClothingStore.Application.Auth.Commands;

public class ForgotPasswordCommandHandler(
    IApplicationDbContext context,
    IEmailTemplateBuilder emailTemplateBuilder,
    IEmailNotificationService emailNotificationService,
    IConfiguration configuration
) : IRequestHandler<ForgotPasswordCommand>
{
    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users.FirstOrDefaultAsync(
            u => u.Email == request.Email,
            cancellationToken
        );

        if (user == null)
        {
            return;
        }

        var token = Guid.NewGuid().ToString();
        user.ResetPasswordToken = token;
        user.ResetPasswordTokenExpiresAt = DateTime.UtcNow.AddHours(24);

        await context.SaveChangesAsync(cancellationToken);

        var frontendUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var resetLink = $"{frontendUrl}/reset-password?token={token}&email={request.Email}";
        var emailBody = emailTemplateBuilder.BuildResetPasswordEmail(user, resetLink);

        await emailNotificationService.SendSafeAsync(
            user.Email,
            "Reset your password",
            emailBody,
            cancellationToken
        );
    }
}
