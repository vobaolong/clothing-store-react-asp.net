using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace ClothingStore.API.Services;

public sealed class CloudinaryImageStorageService(IOptions<CloudinaryOptions> options)
    : IImageStorageService
{
    private readonly CloudinaryOptions _options = options.Value;

    public async Task<ImageUploadResult> UploadImageAsync(
        IFormFile file,
        string folder,
        CancellationToken cancellationToken = default
    )
    {
        if (
            string.IsNullOrWhiteSpace(_options.CloudName)
            || string.IsNullOrWhiteSpace(_options.ApiKey)
            || string.IsNullOrWhiteSpace(_options.ApiSecret)
        )
        {
            throw new InvalidOperationException("Cloudinary configuration is missing.");
        }

        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Image file is empty.");
        }

        if (
            file.ContentType is null
            || !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
        )
        {
            throw new InvalidOperationException("Only image files are allowed.");
        }

        var account = new Account(_options.CloudName, _options.ApiKey, _options.ApiSecret);
        var cloudinary = new Cloudinary(account);
        cloudinary.Api.Secure = true;

        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = BuildFolder(folder),
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
        };

        var result = await cloudinary.UploadAsync(uploadParams, cancellationToken);
        if (result.Error is not null)
        {
            throw new InvalidOperationException(
                $"Cloudinary upload failed: {result.Error.Message}"
            );
        }

        if (string.IsNullOrWhiteSpace(result.SecureUrl?.ToString()))
        {
            throw new InvalidOperationException("Cloudinary did not return a valid image URL.");
        }

        return new ImageUploadResult(result.SecureUrl.ToString(), result.PublicId);
    }

    private string BuildFolder(string folder)
    {
        var root = _options.Folder.Trim('/').Trim();
        var target = folder.Trim('/').Trim();

        if (string.IsNullOrWhiteSpace(root))
            return target;
        if (string.IsNullOrWhiteSpace(target))
            return root;
        return $"{root}/{target}";
    }
}
