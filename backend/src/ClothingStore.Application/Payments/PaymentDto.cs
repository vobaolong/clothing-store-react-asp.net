namespace ClothingStore.Application.Payments;

public record CreateVnPayUrlDto(Guid OrderId);

public record VnPayUrlResponseDto(string PaymentUrl);

public record VnPayIpnResponseDto(string RspCode, string Message);

public record VnPayReturnResponseDto(Guid OrderId, string PaymentStatus, string Message);
