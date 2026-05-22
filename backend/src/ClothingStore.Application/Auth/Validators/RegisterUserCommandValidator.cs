using FluentValidation;
using ClothingStore.Application.Auth.Commands;

namespace ClothingStore.Application.Auth.Validators;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
	public RegisterUserCommandValidator()
	{
		RuleFor(x => x.FullName).NotEmpty().WithMessage("Full name is required.");
		RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid email is required.");
		RuleFor(x => x.Phone).NotEmpty().WithMessage("Phone is required.");
		RuleFor(x => x.Password).NotEmpty().MinimumLength(8).WithMessage("Password must be at least 8 characters.");
	}
}
