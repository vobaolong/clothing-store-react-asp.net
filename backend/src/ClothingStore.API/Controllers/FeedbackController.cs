using ClothingStore.Application.Feedback.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api")]
[AllowAnonymous]
public class FeedbackController(ISender sender) : BaseApiController
{
    [HttpPost("feedback")]
    public async Task<IActionResult> SubmitFeedback(
        SubmitFeedbackCommand command,
        CancellationToken ct
    )
    {
        await sender.Send(command, ct);
        return Ok("Feedback submitted.");
    }
}
