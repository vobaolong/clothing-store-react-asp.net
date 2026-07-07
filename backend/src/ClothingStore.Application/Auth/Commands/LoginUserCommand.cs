using ClothingStore.Application.Auth.Dtos;
using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public record LoginUserCommand(string Email, string Password, bool RememberMe)
    : IRequest<LoginResponseDto>;
