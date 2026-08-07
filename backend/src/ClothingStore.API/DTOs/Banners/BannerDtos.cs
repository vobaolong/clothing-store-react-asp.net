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
