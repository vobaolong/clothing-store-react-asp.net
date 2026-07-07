using ClothingStore.Application.Common.Interfaces;
using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public class LogoutCommandHandler(IRememberMeTokenService rememberMeTokenService)
    : IRequestHandler<LogoutCommand>
{
    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await rememberMeTokenService.RevokeAllForUserAsync(request.UserId, cancellationToken);
    }
}
