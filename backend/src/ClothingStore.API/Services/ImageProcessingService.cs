using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace ClothingStore.API.Services;

public interface IImageProcessingService
{
    Task<Stream> ConvertToWebPAsync(
        Stream inputStream,
        bool preserveTransparency = true,
        CancellationToken cancellationToken = default
    );
}

public class ImageProcessingService : IImageProcessingService
{
    // Maximum allowed dimensions to prevent DoS via oversized images
    private const int MaxWidth = 10000;
    private const int MaxHeight = 10000;

    public async Task<Stream> ConvertToWebPAsync(
        Stream inputStream,
        bool preserveTransparency = true,
        CancellationToken cancellationToken = default
    )
    {
        if (inputStream == null || inputStream.Length == 0)
        {
            throw new ArgumentException(
                "Input stream cannot be null or empty.",
                nameof(inputStream)
            );
        }

        var outputStream = new MemoryStream();

        try
        {
            inputStream.Position = 0;
            using var image = await Image.LoadAsync(inputStream, cancellationToken);

            // Normalize oversized images
            if (image.Width > MaxWidth || image.Height > MaxHeight)
            {
                image.Mutate(x =>
                    x.Resize(
                        new ResizeOptions
                        {
                            Mode = ResizeMode.Max,
                            Size = new Size(MaxWidth, MaxHeight),
                        }
                    )
                );
            }

            var webpEncoder = new WebpEncoder
            {
                Quality = 90,
                Method = WebpEncodingMethod.BestQuality,
            };

            await image.SaveAsync(outputStream, webpEncoder, cancellationToken);

            outputStream.Position = 0;
            return outputStream;
        }
        catch (Exception ex)
        {
            // Log the WebP conversion failure
            Console.WriteLine($"WEBP_CONVERSION_FAILED: {ex.Message}");

            // Fallback: Convert to PNG if WebP encoding fails
            var fallbackStream = new MemoryStream();
            try
            {
                inputStream.Position = 0;
                using var fallbackImage = await Image.LoadAsync(inputStream, cancellationToken);

                await fallbackImage.SaveAsPngAsync(fallbackStream, cancellationToken);
                fallbackStream.Position = 0;

                return fallbackStream;
            }
            catch
            {
                // If everything fails, return the original stream
                inputStream.Position = 0;
                return inputStream;
            }
        }
    }
}
