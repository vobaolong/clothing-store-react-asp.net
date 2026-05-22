using FluentValidation;
using ClothingStore.Application.Auth.Commands;

namespace ClothingStore.Application.Auth.Validators;

public class LoginUserCommandValidator : AbstractValidator<LoginUserCommand>
{
	public LoginUserCommandValidator()
	{
		RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid email is required.");
		RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
	}
}
