using MediatR;

namespace ClothingStore.Application.Auth.Commands;

public record VerifyRegisterOtpCommand(string Email, string OtpCode) : IRequest<bool>;
