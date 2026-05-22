using MediatR;

namespace ClothingStore.Application.Users.Commands;

public record UpdateMyProfileCommand(Guid UserId, string FullName, string Phone) : IRequest;
