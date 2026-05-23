namespace ClothingStore.Application.Products;

public sealed class AdminProductImportRowDto
{
    public int RowNumber { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Material { get; set; }
    public string? Gender { get; set; }
    public string? VariantSku { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string? VariantImageUrls { get; set; }
}

public sealed class AdminProductImportRowErrorDto
{
    public int RowNumber { get; set; }
    public string Error { get; set; } = string.Empty;
}

public sealed class AdminProductImportResultDto
{
    public int TotalRows { get; set; }
    public int TotalProductsDetected { get; set; }
    public int ProductsImported { get; set; }
    public int VariantsImported { get; set; }
    public int FailedRows { get; set; }
    public IReadOnlyList<AdminProductImportRowErrorDto> Errors { get; set; } =
        Array.Empty<AdminProductImportRowErrorDto>();
}
