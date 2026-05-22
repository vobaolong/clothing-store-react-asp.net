using FluentValidation;
using ClothingStore.Application.Auth.Commands;

namespace ClothingStore.Application.Auth.Validators;

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
	public ForgotPasswordCommandValidator()
	{
		RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid email is required.");
	}
}
