using MediatR;

namespace ClothingStore.Application.Users.Commands;

public record LockUserCommand(Guid UserId, string? Reason) : IRequest;
