using MediatR;

namespace ClothingStore.Application.Products.Commands;

public record CreateProductVariant(
    string? Sku,
    string Size,
    string Color,
    string Hex,
    decimal? Price,
    int Quantity,
    string? ImageUrl,
    IReadOnlyList<string>? ImageUrls = null,
    bool IsActive = true
);

public record CreateProductCommand(
    string Name,
    string ProductCode,
    string Description,
    string DescriptionData,
    decimal Price,
    decimal? SalePrice,
    Guid CategoryId,
    IReadOnlyList<CreateProductVariant> Variants
) : IRequest<Guid>;
