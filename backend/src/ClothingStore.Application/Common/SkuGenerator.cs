using System.Text.RegularExpressions;

namespace ClothingStore.Application.Common;

public static class SkuGenerator
{
    public static string Generate(string productCode, string color, string size)
    {
        static string Normalize(string value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? string.Empty
                : SlugGenerator.Generate(value).ToUpperInvariant().Replace("-", string.Empty);
        }

        static string NormalizeSize(string value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? string.Empty
                : Regex.Replace(value.ToUpperInvariant(), @"[\s-]", string.Empty);
        }

        var tokens = new[] { Normalize(productCode), Normalize(color), NormalizeSize(size) }.Where(
            x => !string.IsNullOrWhiteSpace(x)
        );

        return string.Join("-", tokens);
    }
}
