namespace ClothingStore.Application.Common.Interfaces;

public interface IEmailNotificationService
{
    Task SendSafeAsync(
        string? email,
        string subject,
        string body,
        CancellationToken cancellationToken = default);
}