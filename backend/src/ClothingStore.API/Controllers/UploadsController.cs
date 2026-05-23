using ClothingStore.API.DTOs.Uploads;
using ClothingStore.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/uploads")]
[Authorize]
public class UploadsController(IImageStorageService imageStorageService) : BaseApiController
{
    [HttpPost("image")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage(
        [FromForm] UploadImageRequest request,
        CancellationToken ct
    )
    {
        if (request.File is null)
            return BadRequest("File is required.");

        var folder = string.IsNullOrWhiteSpace(request.Folder) ? "general" : request.Folder.Trim();

        var result = await imageStorageService.UploadImageAsync(request.File, folder, ct);
        var response = new UploadImageResponse(result.Url, result.PublicId);
        return Ok(response, "Image uploaded.");
    }
}
