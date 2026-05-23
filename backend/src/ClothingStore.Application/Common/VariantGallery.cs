using System.Text.Json;

namespace ClothingStore.Application.Common;

public static class VariantGallery
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public static List<string> Parse(string? imageUrl, string? galleryJson)
    {
        var list = new List<string>();
        if (!string.IsNullOrWhiteSpace(galleryJson))
        {
            try
            {
                var arr = JsonSerializer.Deserialize<List<string>>(galleryJson, JsonOptions);
                if (arr is not null)
                {
                    foreach (var u in arr)
                    {
                        var t = u?.Trim();
                        if (!string.IsNullOrEmpty(t))
                            list.Add(t);
                    }
                }
            }
            catch (JsonException)
            {
                // ignore invalid json
            }
        }

        if (list.Count == 0 && !string.IsNullOrWhiteSpace(imageUrl))
            list.Add(imageUrl.Trim());

        return DeduplicatePreservingOrder(list);
    }

    public static (string? CoverImageUrl, string? GalleryJson) ToStorage(
        string? imageUrl,
        IReadOnlyList<string>? imageUrls
    )
    {
        var merged = new List<string>();
        if (imageUrls is not null)
        {
            foreach (var u in imageUrls)
            {
                var t = u?.Trim();
                if (!string.IsNullOrEmpty(t))
                    merged.Add(t);
            }
        }

        if (merged.Count == 0 && !string.IsNullOrWhiteSpace(imageUrl))
            merged.Add(imageUrl.Trim());

        merged = DeduplicatePreservingOrder(merged);
        if (merged.Count == 0)
            return (null, null);
        if (merged.Count == 1)
            return (merged[0], null);
        return (merged[0], JsonSerializer.Serialize(merged, JsonOptions));
    }

    private static List<string> DeduplicatePreservingOrder(IReadOnlyList<string> input)
    {
        var seen = new HashSet<string>(StringComparer.Ordinal);
        var result = new List<string>();
        foreach (var s in input)
        {
            if (seen.Add(s))
                result.Add(s);
        }

        return result;
    }
}
