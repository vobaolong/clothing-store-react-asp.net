namespace ClothingStore.Application.Reviews;

public record AdminReviewDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductImage,
    Guid UserId,
    string UserEmail,
    string UserFullName,
    int Rating,
    string? Comment,
    string[]? Tags,
    DateTime CreatedAt
);

public record AdminReviewListResponseDto(IReadOnlyList<AdminReviewDto> Items, int TotalCount);

public record ProductReviewDto(
    Guid Id,
    Guid UserId,
    string UserName,
    int Rating,
    string? Comment,
    IReadOnlyList<string> Tags,
    string? VariantSize,
    string? VariantColor,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool IsMine
);

public record ProductReviewsDto(
    Guid ProductId,
    double AverageRating,
    int TotalCount,
    ProductReviewDto? MyReview,
    IReadOnlyList<ProductReviewDto> Reviews,
    bool CanReview,
    string? EligibilityMessage
);
