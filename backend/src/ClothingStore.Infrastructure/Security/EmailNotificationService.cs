using ClothingStore.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace ClothingStore.Infrastructure.Security;

public class EmailNotificationService(
		IEmailSender emailSender,
		ILogger<EmailNotificationService> logger
) : IEmailNotificationService
{
	public async Task SendSafeAsync(
			string? email,
			string subject,
			string body,
			CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(email) ||
				string.IsNullOrWhiteSpace(subject) ||
				string.IsNullOrWhiteSpace(body))
		{
			return;
		}

		try
		{
			await emailSender.SendEmailAsync(email, subject, body, cancellationToken);
		}
		catch (OperationCanceledException)
		{
			logger.LogWarning(
					"Email sending was cancelled for {Email}",
					email);
		}
		catch (Exception ex)
		{
			logger.LogError(
					ex,
					"Failed to send email to {Email}",
					email);
		}
	}
}