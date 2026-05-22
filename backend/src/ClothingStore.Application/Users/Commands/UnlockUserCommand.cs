using MediatR;

namespace ClothingStore.Application.Users.Commands;

public record UnlockUserCommand(Guid UserId) : IRequest;
