using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Common.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace ClothingStore.Infrastructure.Security;

public class MailKitEmailSender(
		IOptions<EmailSettings> emailSettings,
		ILogger<MailKitEmailSender> logger
) : IEmailSender
{
	private readonly EmailSettings settings = emailSettings.Value;

	public async Task SendEmailAsync(
			string to,
			string subject,
			string body,
			CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(to) ||
				string.IsNullOrWhiteSpace(subject) ||
				string.IsNullOrWhiteSpace(body))
		{
			return;
		}

		var message = new MimeMessage();

		message.From.Add(
				new MailboxAddress(
						settings.FromName,
						settings.FromEmail));

		message.To.Add(
				MailboxAddress.Parse(to));

		message.Subject = subject;

		message.Body = new BodyBuilder
		{
			HtmlBody = body
		}.ToMessageBody();

		using var client = new SmtpClient();

		try
		{
			await client.ConnectAsync(
					settings.Host,
					settings.Port,
					SecureSocketOptions.StartTls,
					cancellationToken);

			await client.AuthenticateAsync(
					settings.Username,
					settings.Password,
					cancellationToken);

			await client.SendAsync(
					message,
					cancellationToken);
		}
		catch (OperationCanceledException)
		{
			logger.LogWarning(
					"Email sending was cancelled for {Email}",
					to);
		}
		catch (Exception ex)
		{
			logger.LogError(
					ex,
					"Failed to send email to {Email}",
					to);
		}
		finally
		{
			if (client.IsConnected)
			{
				await client.DisconnectAsync(
						true,
						cancellationToken);
			}
		}
	}
}