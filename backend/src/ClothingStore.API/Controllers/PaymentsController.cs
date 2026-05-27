using ClothingStore.API.Services;
using ClothingStore.Application.Payments.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VNPAY;

namespace ClothingStore.API.Controllers;

[Route("api/payments")]
public class PaymentsController(
    IVnpayClient vnpayClient,
    IUserContext userContext,
    ISender sender,
    IConfiguration configuration
) : BaseApiController
{
    [HttpPost("vnpay/create-url")]
    [Authorize]
    public async Task<IActionResult> CreateVnPayUrl(
        CreateVnPayUrlRequest request,
        CancellationToken ct
    )
    {
        var userId = userContext.GetRequiredUserId();
        var url = await sender.Send(new CreateVnPayUrlCommand(userId, request.OrderId), ct);
        return Ok(new { paymentUrl = url }, "VNPay URL generated.");
    }

    [HttpGet("vnpay/return")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleVnPayReturn(CancellationToken ct)
    {
        var paymentResult = vnpayClient.GetPaymentResult(Request);
        var responseCode = Request.Query["vnp_ResponseCode"].ToString();
        var result = await sender.Send(
            new ProcessVnPayReturnCommand(paymentResult, responseCode),
            ct
        );
        return Ok(result, result.Message);
    }

    [HttpGet("vnpay/proceed-after-payment")]
    [AllowAnonymous]
    public async Task<IActionResult> ProceedAfterPayment(CancellationToken ct)
    {
        var paymentResult = vnpayClient.GetPaymentResult(Request);
        var responseCode = Request.Query["vnp_ResponseCode"].ToString();
        var vnpAmountRaw = Request.Query["vnp_Amount"].ToString();
        long.TryParse(vnpAmountRaw, out var vnpAmount);

        await sender.Send(new ProcessVnPayIpnCommand(paymentResult, responseCode, vnpAmount), ct);

        var frontendBaseUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var redirectUrl =
            $"{frontendBaseUrl}/payment-return?{Request.QueryString.Value?.TrimStart('?')}";
        return Redirect(redirectUrl);
    }
}

public record CreateVnPayUrlRequest(Guid OrderId);
