using ClothingStore.Domain.Enums;

namespace ClothingStore.Application.Categories;

public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Image,
    string? Description,
    Guid? ParentId,
    byte Level,
    string Gender,
    string? ProductType,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CategoryUpsertDto(
    string Name,
    string? Image = null,
    string? Description = null,
    Guid? ParentId = null,
    byte? Level = null,
    Gender? Gender = null,
    ProductType? ProductType = null,
    bool? IsActive = null
);

public record CategoryBulkItemDto(string Name, string? Image = null, string? Description = null);
