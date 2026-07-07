using ClothingStore.Application.Auth.Dtos;
using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public record RefreshTokenCommand(string RememberMeToken) : IRequest<LoginResponseDto>;
