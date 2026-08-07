using System.Net;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Common.Models;
using MediatR;
using Microsoft.Extensions.Options;

namespace ClothingStore.Application.Feedback.Commands;

public class SubmitFeedbackCommandHandler(
    IEmailNotificationService emailNotificationService,
    IOptions<EmailSettings> emailSettings
) : IRequestHandler<SubmitFeedbackCommand>
{
    public Task Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        var recipient = emailSettings.Value.FromEmail;
        var subject = $"[Góp ý] {request.Name} - {request.Email}";
        var body =
            $"Họ tên: {WebUtility.HtmlEncode(request.Name)}\nEmail: {WebUtility.HtmlEncode(request.Email)}\n\nNội dung:\n{WebUtility.HtmlEncode(request.Message)}";

        return emailNotificationService.SendSafeAsync(
            recipient,
            subject,
            body,
            cancellationToken
        );
    }
}
