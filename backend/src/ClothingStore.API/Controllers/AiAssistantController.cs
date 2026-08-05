using ClothingStore.Application.AI;
using ClothingStore.Application.AI.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/ai")]
public class AiAssistantController(IAiService aiService) : BaseApiController
{
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequestDto request, CancellationToken ct)
    {
        var result = await aiService.ChatAsync(request, ct);
        return Ok(result, "OK");
    }
}
