using ClothingStore.Application.Common.Interfaces;

namespace ClothingStore.Infrastructure.Security;

public class ConsoleEmailSender : IEmailSender
{
    public Task SendEmailAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken = default
    )
    {
        return Task.CompletedTask;
    }
}
