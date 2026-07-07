using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public record LogoutCommand(Guid UserId) : IRequest;
