using ClothingStore.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace ClothingStore.Infrastructure.Security;

public class EmailNotificationService(
    IBackgroundEmailQueue emailQueue,
    ILogger<EmailNotificationService> logger
) : IEmailNotificationService
{
    public Task SendSafeAsync(
        string? email,
        string subject,
        string body,
        CancellationToken cancellationToken = default
    )
    {
        if (
            string.IsNullOrWhiteSpace(email)
            || string.IsNullOrWhiteSpace(subject)
            || string.IsNullOrWhiteSpace(body)
        )
        {
            return Task.CompletedTask;
        }

        try
        {
            if (!emailQueue.TryQueue(email, subject, body))
            {
                logger.LogWarning("Email could not be queued for {Email}", email);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to queue email to {Email}", email);
        }

        return Task.CompletedTask;
    }
}
