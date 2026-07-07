using ClothingStore.API.Services;
using ClothingStore.Application.Cart.Commands;
using ClothingStore.Application.Cart.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Authorize]
[Route("api/cart")]
public class CartController(ISender sender, IUserContext userContext) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetMyCart(CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        var data = await sender.Send(new GetMyCartQuery(userId), ct);
        return Ok(data, "Cart fetched.");
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart(AddToCartRequest request, CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        var data = await sender.Send(
            new AddToCartCommand(
                userId,
                request.ProductId,
                request.ProductVariantId,
                request.Quantity
            ),
            ct
        );
        return Ok(data, "Added to cart.");
    }

    [HttpPut("{cartItemId:guid}")]
    public async Task<IActionResult> UpdateQuantity(
        Guid cartItemId,
        UpdateQuantityRequest request,
        CancellationToken ct
    )
    {
        var userId = userContext.GetRequiredUserId();
        var data = await sender.Send(
            new UpdateCartItemQuantityCommand(userId, cartItemId, request.Quantity),
            ct
        );
        return Ok(data, "Quantity updated.");
    }

    [HttpDelete("{cartItemId:guid}")]
    public async Task<IActionResult> RemoveFromCart(Guid cartItemId, CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        await sender.Send(new RemoveFromCartCommand(userId, cartItemId), ct);
        return Ok("Removed from cart.");
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        await sender.Send(new ClearMyCartCommand(userId), ct);
        return Ok("Cart cleared.");
    }

    [HttpPost("merge")]
    public async Task<IActionResult> MergeGuestCart(
        MergeGuestCartRequest request,
        CancellationToken ct
    )
    {
        var userId = userContext.GetRequiredUserId();
        var data = await sender.Send(
            new MergeGuestCartCommand(
                userId,
                request
                    .Items.Select(x => new GuestCartItemDto(
                        x.ProductId,
                        x.ProductVariantId,
                        x.Quantity
                    ))
                    .ToList()
            ),
            ct
        );
        return Ok(data, "Cart merged.");
    }
}

public record AddToCartRequest(Guid ProductId, Guid ProductVariantId, int Quantity);

public record UpdateQuantityRequest(int Quantity);

public record MergeGuestCartItemDto(Guid ProductId, Guid ProductVariantId, int Quantity);

public record MergeGuestCartRequest(IReadOnlyList<MergeGuestCartItemDto> Items);
