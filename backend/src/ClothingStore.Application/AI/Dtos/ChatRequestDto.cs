namespace ClothingStore.Application.AI.Dtos;

public sealed record ChatRequestDto(string Message, IReadOnlyList<ChatHistoryDto>? History = null);

public sealed record ChatHistoryDto(string Role, string Text);

public sealed record ChatResponseDto(
    string Reply,
    IReadOnlyList<ChatProductDto>? Products = null,
    IReadOnlyList<ChatRecommendationDto>? Recommendations = null,
    ChatOrderStatusDto? OrderStatus = null,
    IReadOnlyList<ChatPromotionDto>? Promotions = null,
    IReadOnlyList<ChatFaqDto>? Faqs = null,
    IReadOnlyList<ChatPolicyDto>? Policies = null,
    ChatSizeGuideDto? SizeGuide = null
);

public sealed record ChatProductDto(
    string Id,
    string Name,
    string Slug,
    decimal Price,
    decimal? SalePrice,
    string? ImageUrl,
    IReadOnlyList<string> Colors,
    IReadOnlyList<string> Sizes,
    double AverageRating,
    int ReviewCount,
    int Stock
);

public sealed record ChatRecommendationDto(
    string Id,
    string Name,
    string Slug,
    decimal Price,
    decimal? SalePrice,
    string? ImageUrl,
    string Reason
);

public sealed record ChatOrderStatusDto(
    string OrderId,
    string Status,
    string? EstimatedDelivery,
    IReadOnlyList<ChatOrderHistoryDto> History
);

public sealed record ChatOrderHistoryDto(string Status, string Timestamp);

public sealed record ChatPromotionDto(
    string Code,
    string Description,
    decimal? DiscountPercent,
    decimal? DiscountAmount,
    decimal? MinOrderValue
);

public sealed record ChatFaqDto(string Question, string Answer);

public sealed record ChatPolicyDto(string Title, string Content);

public sealed record ChatSizeGuideDto(
    string? RecommendedSize,
    IReadOnlyList<SizeGuideRowDto>? SizeGuide
);

public sealed record SizeGuideRowDto(
    string Size,
    string Height,
    string Weight,
    string Chest,
    string Waist
);
