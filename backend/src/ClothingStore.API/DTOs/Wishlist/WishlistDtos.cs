namespace ClothingStore.API.DTOs.Wishlist;

public record WishlistItemResponseDto(
    Guid Id,
    string Name,
    decimal Price,
    string? ImageUrl,
    bool IsActive
);
