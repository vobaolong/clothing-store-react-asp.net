using ClothingStore.Domain.Entities;

namespace ClothingStore.Application.Common.Interfaces;

public interface IEmailTemplateBuilder
{
    string BuildOrderPlacedEmail(Order order, User user);
    string BuildOrderDeliveredEmail(Order order, User user);
    string BuildUserLockedEmail(User user, string? reason);
    string BuildUserUnlockedEmail(User user);
    string BuildWelcomeEmail(User user);
    string BuildResetPasswordEmail(User user, string resetLink);
    string BuildRegisterOtpEmail(User user, string otpCode);
    string BuildFeedbackEmail(string name, string email, string message);
}
