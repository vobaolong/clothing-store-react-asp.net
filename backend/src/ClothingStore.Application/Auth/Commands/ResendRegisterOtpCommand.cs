using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public record ResendRegisterOtpCommand(string Email) : IRequest<bool>;
