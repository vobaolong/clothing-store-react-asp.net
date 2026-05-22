using ClothingStore.Application.Wishlist.Commands;
using ClothingStore.Application.Wishlist.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClothingStore.API.Services;

namespace ClothingStore.API.Controllers;

[Authorize]
[Route("api/wishlist")]
public class WishlistController(ISender sender, IUserContext userContext) : BaseApiController
{
	[HttpGet]
	public async Task<IActionResult> GetMyWishlist(CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		var data = await sender.Send(new GetMyWishlistQuery(userId), ct);
		return Ok(data, "Wishlist fetched.");
	}

	[HttpPost("{productId:guid}")]
	public async Task<IActionResult> Add(Guid productId, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		await sender.Send(new AddToWishlistCommand(userId, productId), ct);
		return Ok("Added to wishlist.");
	}

	[HttpDelete("{productId:guid}")]
	public async Task<IActionResult> Remove(Guid productId, CancellationToken ct)
	{
		var userId = userContext.GetRequiredUserId();
		await sender.Send(new RemoveFromWishlistCommand(userId, productId), ct);
		return Ok("Removed from wishlist.");
	}
}