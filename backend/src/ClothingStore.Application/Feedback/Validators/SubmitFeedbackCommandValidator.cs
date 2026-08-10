using ClothingStore.Application.Feedback.Commands;
using FluentValidation;

namespace ClothingStore.Application.Feedback.Validators;

public class SubmitFeedbackCommandValidator : AbstractValidator<SubmitFeedbackCommand>
{
    public SubmitFeedbackCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
    }
}
