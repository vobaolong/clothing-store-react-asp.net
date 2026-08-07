namespace ClothingStore.API.DTOs.Banners;

public record UpsertBannerRequest(
    string ImageUrl,
    string CtaLink,
    bool IsActive,
    int DisplayOrder,
    DateTime? StartsAt,
    DateTime? EndsAt
);

public record BannerReorderItem(Guid Id, int DisplayOrder);

public record BannerActiveDto(
    Guid Id,
    string ImageUrl,
    string CtaLink,
    int DisplayOrder
);
