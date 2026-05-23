using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VNPAY.Models;

namespace ClothingStore.Application.Payments.Commands;

public record ProcessVnPayReturnCommand(VnpayPaymentResult Result, string ResponseCode)
    : IRequest<VnPayReturnResponseDto>;

public class ProcessVnPayReturnCommandHandler(IPaymentService paymentService)
    : IRequestHandler<ProcessVnPayReturnCommand, VnPayReturnResponseDto>
{
    public async Task<VnPayReturnResponseDto> Handle(
        ProcessVnPayReturnCommand request,
        CancellationToken ct
    )
    {
        var order =
            await paymentService.FindOrderForPaymentResultAsync(request.Result, ct)
            ?? throw new KeyNotFoundException("Order not found.");

        var isSuccess = request.ResponseCode == "00";

        if (!isSuccess)
        {
            return new VnPayReturnResponseDto(
                order.Id,
                order.PaymentStatus.ToString(),
                "VNPay payment was not successful."
            );
        }

        if (order.PaymentStatus == PaymentStatus.Paid || order.PaidAt != null)
        {
            return new VnPayReturnResponseDto(
                order.Id,
                order.PaymentStatus.ToString(),
                "VNPay payment already handled."
            );
        }

        try
        {
            await paymentService.MarkOrderPaidAsync(order, ct);
            return new VnPayReturnResponseDto(
                order.Id,
                PaymentStatus.Paid.ToString(),
                "VNPay payment result handled."
            );
        }
        catch (DbUpdateConcurrencyException)
        {
            return new VnPayReturnResponseDto(
                order.Id,
                order.PaymentStatus.ToString(),
                "Concurrency conflict during payment update."
            );
        }
    }
}
