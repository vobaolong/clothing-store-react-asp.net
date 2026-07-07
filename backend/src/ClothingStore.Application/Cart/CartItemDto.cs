namespace ClothingStore.Application.Cart;

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductSlug,
    Guid ProductVariantId,
    string VariantSku,
    string Size,
    string Color,
    string Hex,
    decimal Price,
    decimal? SalePrice,
    DateTime? SalePriceStartDate,
    DateTime? SalePriceEndDate,
    int Quantity,
    int AvailableStock,
    string? ImageUrl,
    IReadOnlyList<string> ImageUrls
);
