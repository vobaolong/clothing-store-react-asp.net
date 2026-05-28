using Microsoft.AspNetCore.Http;

namespace ClothingStore.API.Extensions;

public static class FormFileExtensions
{
    private static readonly HashSet<string> AllowedImageExtensions = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".tiff",
        ".tif",
        ".gif",
    };

    private static readonly HashSet<string> AllowedImageMimeTypes = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/bmp",
        "image/tiff",
        "image/gif",
    };

    public static bool IsValidImageFile(this IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        // Check MIME type
        if (
            string.IsNullOrEmpty(file.ContentType)
            || !AllowedImageMimeTypes.Contains(file.ContentType)
        )
            return false;

        // Check file extension
        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension) || !AllowedImageExtensions.Contains(extension))
            return false;

        return true;
    }

    public static string GetWebPFileName(this IFormFile file)
    {
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(file.FileName);
        return $"{fileNameWithoutExtension}.webp";
    }
}
