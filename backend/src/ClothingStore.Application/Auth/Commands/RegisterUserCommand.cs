using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public record RegisterUserCommand(string FullName, string Email, string Phone, string Password)
		: IRequest<Guid>;
