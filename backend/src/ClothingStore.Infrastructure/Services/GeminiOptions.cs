namespace ClothingStore.Infrastructure.Services;

public sealed class GeminiOptions
{
    public const string SectionName = "Gemini";
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gemini-flash-latest";
    public string Endpoint { get; set; } =
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
}