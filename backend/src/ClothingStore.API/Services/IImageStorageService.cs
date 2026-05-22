namespace ClothingStore.API.Services;

public interface IImageStorageService
{
	Task<ImageUploadResult> UploadImageAsync(
		IFormFile file,
		string folder,
		CancellationToken cancellationToken = default
	);
}

public sealed record ImageUploadResult(string Url, string PublicId);
