namespace ClothingStore.Application.AI.Dtos;

public sealed record AiSearchRequestDto(
    string? Category,
    string? Gender,
    decimal? PriceMin,
    decimal? PriceMax,
    string? Size,
    string? Color,
    string? Material,
    string? Style,
    string? Occasion,
    string? Brand
);
