using ClothingStore.Application.Products;

namespace ClothingStore.Application.AI.Dtos;

public sealed record AiProductResultDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    decimal Price,
    decimal? SalePrice,
    string? ImageUrl,
    IReadOnlyList<string> AvailableColors,
    IReadOnlyList<string> AvailableSizes,
    string? Material,
    string? CategoryName,
    string? Brand,
    double AverageRating,
    int ReviewCount,
    int Stock
);

public sealed record AiSearchResponseDto(
    IReadOnlyList<AiProductResultDto> Products,
    int TotalCount
);

public sealed record AiProductDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    string? DescriptionHtml,
    decimal Price,
    decimal? SalePrice,
    DateTime? SalePriceStartDate,
    DateTime? SalePriceEndDate,
    string? ImageUrl,
    IReadOnlyList<string> ImageUrls,
    IReadOnlyList<AiVariantDto> Variants,
    string? Material,
    string? CategoryName,
    string? Brand,
    double AverageRating,
    int ReviewCount,
    int Stock,
    int SoldCount
);

public sealed record AiVariantDto(
    Guid Id,
    string Size,
    string Color,
    string Hex,
    int Quantity,
    string? ImageUrl
);

public sealed record AiInventoryDto(Guid ProductId, string Size, int Quantity, bool InStock);

public sealed record AiVariantCheckDto(
    string Color,
    string Hex,
    bool Available,
    IReadOnlyList<string> AvailableSizes
);

public sealed record AiCompareProductDto(
    Guid Id,
    string Name,
    string? ImageUrl,
    decimal Price,
    decimal? SalePrice,
    string? Material,
    IReadOnlyList<string> Colors,
    IReadOnlyList<string> Sizes,
    string? Description,
    double AverageRating
);

public sealed record AiCompareResultDto(
    IReadOnlyList<AiCompareProductDto> Products,
    string? ComparisonSummary
);

public sealed record AiRecommendationDto(
    Guid Id,
    string Name,
    string Slug,
    decimal Price,
    decimal? SalePrice,
    string? ImageUrl,
    string? CategoryName,
    double AverageRating,
    string RecommendationReason
);

public sealed record AiSizeRecommendationDto(
    string? RecommendedSize,
    string? SizeGuideUrl,
    IReadOnlyList<AiSizeGuideRowDto>? SizeGuide
);

public sealed record AiSizeGuideRowDto(
    string Size,
    string? Height,
    string? Weight,
    string? Chest,
    string? Waist
);

public sealed record AiFaqDto(string Question, string Answer, string Category);

public sealed record AiShippingPolicyDto(string Title, string Content);

public sealed record AiReturnPolicyDto(string Title, string Content);

public sealed record AiOrderStatusDto(
    Guid OrderId,
    string Status,
    string? EstimatedDelivery,
    IReadOnlyList<AiOrderStatusHistoryDto> History
);

public sealed record AiOrderStatusHistoryDto(string Status, DateTime Timestamp, string? Note);

public sealed record AiPromotionDto(
    string Code,
    string Description,
    decimal? DiscountPercent,
    decimal? DiscountAmount,
    decimal? MinOrderValue,
    DateTime? ValidFrom,
    DateTime? ValidTo,
    bool IsActive
);
