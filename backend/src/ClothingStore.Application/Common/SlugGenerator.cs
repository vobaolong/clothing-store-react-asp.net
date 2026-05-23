using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace ClothingStore.Application.Common;

public static partial class SlugGenerator
{
    public static string Generate(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var slug = RemoveDiacritics(input.Trim().ToLowerInvariant());
        slug = NonAlphanumericRegex().Replace(slug, string.Empty);
        slug = WhitespaceRegex().Replace(slug, "-");
        return MultiDashRegex().Replace(slug, "-").Trim('-');
    }

    private static string RemoveDiacritics(string text)
    {
        var normalized = text.Replace('đ', 'd')
            .Replace('Đ', 'D')
            .Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);

        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }

    [GeneratedRegex(@"[^a-z0-9\s-]")]
    private static partial Regex NonAlphanumericRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();

    [GeneratedRegex(@"-+")]
    private static partial Regex MultiDashRegex();
}
