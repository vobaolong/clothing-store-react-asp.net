using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VNPAY.Models;

namespace ClothingStore.Application.Payments.Commands;

public record ProcessVnPayReturnCommand(VnpayPaymentResult Result, string ResponseCode)
    : IRequest<VnPayReturnResponseDto>;

public class ProcessVnPayReturnCommandHandler(
    IPaymentService paymentService,
    IApplicationDbContext context
) : IRequestHandler<ProcessVnPayReturnCommand, VnPayReturnResponseDto>
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
            // Nếu order chưa lưu vào DB (chỉ trong cache), cộng lại tồn kho
            var existsInDb = await context.Orders.AnyAsync(o => o.Id == order.Id, ct);
            if (!existsInDb)
            {
                var variantIds = order.Items.Select(i => i.ProductVariantId).ToList();
                var variants = await context
                    .ProductVariants.Where(v => variantIds.Contains(v.Id))
                    .ToDictionaryAsync(v => v.Id, ct);

                foreach (var item in order.Items)
                {
                    if (variants.TryGetValue(item.ProductVariantId, out var variant))
                        variant.Quantity += item.Quantity;
                }

                await context.SaveChangesAsync(ct);
            }

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
