using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VNPAY.Models;

namespace ClothingStore.Application.Payments.Commands;

public record ProcessVnPayIpnCommand(VnpayPaymentResult Result, string ResponseCode, long VnpAmount)
    : IRequest<VnPayIpnResponseDto>;

public class ProcessVnPayIpnCommandHandler(IPaymentService paymentService)
    : IRequestHandler<ProcessVnPayIpnCommand, VnPayIpnResponseDto>
{
    public async Task<VnPayIpnResponseDto> Handle(
        ProcessVnPayIpnCommand request,
        CancellationToken ct
    )
    {
        var order = await paymentService.FindOrderForPaymentResultAsync(request.Result, ct);
        if (order is null)
            return new VnPayIpnResponseDto("01", "Order not found");

        var expectedAmount = Convert.ToInt64(
            Math.Round(order.TotalAmount * 100m, MidpointRounding.AwayFromZero)
        );
        if (request.VnpAmount != expectedAmount)
            return new VnPayIpnResponseDto("04", "Invalid amount");

        if (request.ResponseCode != "00")
            return new VnPayIpnResponseDto("00", "Confirm Success");

        if (order.PaymentStatus == PaymentStatus.Paid || order.PaidAt != null)
            return new VnPayIpnResponseDto("02", "Order already confirmed");

        try
        {
            await paymentService.MarkOrderPaidAsync(order, ct);
            return new VnPayIpnResponseDto("00", "Confirm Success");
        }
        catch (DbUpdateConcurrencyException)
        {
            return new VnPayIpnResponseDto("02", "Order already confirmed");
        }
    }
}
