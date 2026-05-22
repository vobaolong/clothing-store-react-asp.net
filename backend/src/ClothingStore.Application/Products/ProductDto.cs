namespace ClothingStore.Application.Products;

public record CategoryBreadcrumbDto(Guid Id, string Name, string Slug);

public record ProductVariantDto(
		Guid Id,
		string Sku,
		string Size,
		string Color,
		string Hex,
		decimal? Price,
		int Quantity,
		string? ImageUrl,
		IReadOnlyList<string> ImageUrls,
		bool IsActive
);

public record ProductDto(
		Guid Id,
		string Name,
		string ProductCode,
		string Slug,
		string Description,
		string DescriptionData,
		decimal Price,
		decimal? SalePrice,
		DateTime? SalePriceStartDate,
		DateTime? SalePriceEndDate,
		string Category,
		string CategorySlug,
		Guid CategoryId,
		int Stock,
		int TotalAvailable,
		int SoldCount,
		double AverageRating,
		int ReviewCount,
		DateTime CreatedAt,
		IReadOnlyList<CategoryBreadcrumbDto> CategoryBreadcrumbs,
		IReadOnlyList<ProductVariantDto> Variants
);
