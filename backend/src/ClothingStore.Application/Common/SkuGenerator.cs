namespace ClothingStore.Application.Common;

public static class SkuGenerator
{
    public static string Generate(params string[] parts)
    {
        var tokens = parts
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .Select(part => SlugGenerator.Generate(part).ToUpperInvariant())
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .ToArray();
        return string.Join('-', tokens);
    }
}
