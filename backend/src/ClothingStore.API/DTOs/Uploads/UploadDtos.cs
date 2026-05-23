namespace ClothingStore.API.DTOs.Uploads;

public sealed class UploadImageRequest
{
    public IFormFile? File { get; set; }
    public string? Folder { get; set; }
}

public sealed record UploadImageResponse(string Url, string PublicId);
