namespace ClothingStore.API.DTOs.Banners;

public record UpsertBannerRequest(
    string ImageUrl,
    string CtaLink,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt
);
