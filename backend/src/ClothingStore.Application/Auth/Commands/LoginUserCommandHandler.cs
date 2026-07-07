using ClothingStore.Application.Auth.Dtos;
using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Auth.Commands;

public class LoginUserCommandHandler(
    IApplicationDbContext context,
    IJwtTokenService jwtTokenService,
    IPasswordHasher passwordHasher,
    IRememberMeTokenService rememberMeTokenService
) : IRequestHandler<LoginUserCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(
        LoginUserCommand request,
        CancellationToken cancellationToken
    )
    {
        var user = await context.Users.FirstOrDefaultAsync(
            x => x.Email == request.Email,
            cancellationToken
        );

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsEmailVerified)
            throw new UnauthorizedAccessException(
                "Account email has not been verified. Please verify your email before logging in."
            );

        if (user.IsLocked)
            throw new UnauthorizedAccessException("Account has been locked.");

        var jwt = jwtTokenService.GenerateToken(user);
        string? rememberMeToken = null;

        if (request.RememberMe)
            rememberMeToken = await rememberMeTokenService.GenerateTokenAsync(
                user,
                cancellationToken
            );

        return new LoginResponseDto(jwt, rememberMeToken);
    }
}
