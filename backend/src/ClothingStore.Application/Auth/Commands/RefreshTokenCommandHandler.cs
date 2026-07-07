using ClothingStore.Application.Auth.Dtos;
using ClothingStore.Application.Common.Interfaces;
using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public class RefreshTokenCommandHandler(
    IRememberMeTokenService rememberMeTokenService,
    IJwtTokenService jwtTokenService
) : IRequestHandler<RefreshTokenCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken
    )
    {
        var user = await rememberMeTokenService.ValidateAndRotateAsync(
            request.RememberMeToken,
            cancellationToken
        );

        if (user is null)
            throw new UnauthorizedAccessException("Invalid or expired remember-me token.");

        var newRememberMe = await rememberMeTokenService.GenerateTokenAsync(
            user,
            cancellationToken
        );

        var jwt = jwtTokenService.GenerateToken(user);

        return new LoginResponseDto(jwt, newRememberMe);
    }
}
