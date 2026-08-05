namespace ClothingStore.Application.Products;

public sealed class AdminProductVariantDto
{
    public string Sku { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Hex { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public int Quantity { get; set; }
    public string? ImageUrl { get; set; }
    public IReadOnlyList<string>? ImageUrls { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class AdminProductVariantResponseDto
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Hex { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public int Quantity { get; set; }
    public string? ImageUrl { get; set; }
    public IReadOnlyList<string> ImageUrls { get; set; } = [];
    public bool IsActive { get; set; }
}

public sealed class AdminProductUpsertDto
{
    public string Name { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionData { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public DateTime? SalePriceStartDate { get; set; }
    public DateTime? SalePriceEndDate { get; set; }
    public Guid CategoryId { get; set; }
    public bool IsActive { get; set; } = true;
    public IReadOnlyList<AdminProductVariantDto> Variants { get; set; } = [];
}

public sealed class AdminProductResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionData { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public DateTime? SalePriceStartDate { get; set; }
    public DateTime? SalePriceEndDate { get; set; }
    public int Stock { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int SoldCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public IReadOnlyList<AdminProductVariantResponseDto> Variants { get; set; } = [];
}
