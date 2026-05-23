using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using VNPAY;
using VNPAY.Models;
using VNPAY.Models.Enums;

namespace ClothingStore.Application.Payments.Commands;

public record CreateVnPayUrlCommand(Guid UserId, Guid OrderId) : IRequest<string>;

public class CreateVnPayUrlCommandHandler(
    IApplicationDbContext context,
    IVnpayClient vnpayClient,
    IConfiguration configuration,
    IMemoryCache memoryCache
) : IRequestHandler<CreateVnPayUrlCommand, string>
{
    public async Task<string> Handle(CreateVnPayUrlCommand request, CancellationToken ct)
    {
        var isFromCache = false;
        var order = await context.Orders.FirstOrDefaultAsync(
            o => o.Id == request.OrderId && o.UserId == request.UserId,
            ct
        );
        if (order == null)
        {
            if (
                memoryCache.TryGetValue($"vnpay_order_{request.OrderId}", out Order? cachedOrder)
                && cachedOrder != null
            )
            {
                if (cachedOrder.UserId != request.UserId)
                {
                    throw new UnauthorizedAccessException("You do not have access to this order.");
                }
                order = cachedOrder;
                isFromCache = true;
            }
        }

        if (order == null)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        var tmnCode = configuration["VNPAY:TmnCode"];
        var hashSecret = configuration["VNPAY:HashSecret"];
        if (string.IsNullOrWhiteSpace(tmnCode) || string.IsNullOrWhiteSpace(hashSecret))
        {
            throw new InvalidOperationException(
                "VNPAY service is not configured (missing TmnCode/HashSecret)."
            );
        }

        var paymentUrlDetail = vnpayClient.CreatePaymentUrl(
            new VnpayPaymentRequest
            {
                Money = Convert.ToDouble(order.TotalAmount),
                Description = $"Payment for order {order.Id}",
                BankCode = BankCode.ANY,
                Language = DisplayLanguage.Vietnamese,
            }
        );

        order.PaymentTransactionId = paymentUrlDetail.PaymentId.ToString();

        if (isFromCache)
        {
            memoryCache.Set(
                $"vnpay_order_{order.Id}",
                order,
                new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
            );
        }
        else
        {
            await context.SaveChangesAsync(ct);
        }

        return paymentUrlDetail.Url;
    }
}
