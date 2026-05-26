using ClothingStore.Application.Common.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ClothingStore.Infrastructure.Security;

public sealed class BackgroundEmailSenderService(
    IBackgroundEmailQueue emailQueue,
    IServiceScopeFactory scopeFactory,
    ILogger<BackgroundEmailSenderService> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            QueuedEmail email;
            try
            {
                email = await emailQueue.DequeueAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var sender = scope.ServiceProvider.GetRequiredService<IEmailSender>();
                await sender.SendEmailAsync(email.To, email.Subject, email.Body, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send queued email to {Email}", email.To);
            }
        }
    }
}
