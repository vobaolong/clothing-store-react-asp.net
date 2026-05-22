using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public record ForgotPasswordCommand(string Email) : IRequest;
