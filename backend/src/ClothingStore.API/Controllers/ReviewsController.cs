using ClothingStore.API.Services;
using ClothingStore.Application.Reviews.Commands;
using ClothingStore.Application.Reviews.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api")]
public class ReviewsController(ISender sender, IUserContext userContext) : BaseApiController
{
    [HttpGet("products/{productId:guid}/reviews")]
    public async Task<IActionResult> GetProductReviews(Guid productId, CancellationToken ct)
    {
        var userId = userContext.GetUserId();
        var data = await sender.Send(new GetProductReviewsQuery(productId, userId), ct);
        return Ok(data, "Reviews fetched.");
    }

    [Authorize]
    [HttpPost("reviews")]
    public async Task<IActionResult> CreateReview(CreateReviewRequest request, CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        var data = await sender.Send(
            new CreateReviewCommand(
                userId,
                request.ProductId,
                request.OrderItemId,
                request.Rating,
                request.Comment,
                request.Tags
            ),
            ct
        );
        return Ok(data, "Review created.");
    }

    [Authorize]
    [HttpPut("reviews/{id:guid}")]
    public async Task<IActionResult> UpdateReview(
        Guid id,
        UpdateReviewRequest request,
        CancellationToken ct
    )
    {
        var userId = userContext.GetRequiredUserId();
        var data = await sender.Send(
            new UpdateReviewCommand(userId, id, request.Rating, request.Comment),
            ct
        );
        return Ok(data, "Review updated.");
    }

    [Authorize]
    [HttpDelete("reviews/{id:guid}")]
    public async Task<IActionResult> DeleteReview(Guid id, CancellationToken ct)
    {
        var userId = userContext.GetRequiredUserId();
        await sender.Send(new DeleteReviewCommand(userId, id), ct);
        return Ok("Review deleted.");
    }
}

public record CreateReviewRequest(
    Guid ProductId,
    Guid OrderItemId,
    int Rating,
    string? Comment,
    string[]? Tags
);

public record UpdateReviewRequest(int Rating, string? Comment);
