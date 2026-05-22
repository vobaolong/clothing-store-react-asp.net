namespace ClothingStore.Domain.Entities;

public class ProductVariant : BaseEntity
{
	public Guid ProductId { get; set; }
	public Product? Product { get; set; }
	public string Sku { get; set; } = string.Empty;
	public string Size { get; set; } = string.Empty;
	public string Color { get; set; } = string.Empty;
	public string ColorHex { get; set; } = string.Empty;
	public decimal? Price { get; set; }
	public int Quantity { get; set; }
	public string? ImageUrl { get; set; }
	public string? VariantGalleryJson { get; set; }
	public bool IsActive { get; set; } = true;
}
