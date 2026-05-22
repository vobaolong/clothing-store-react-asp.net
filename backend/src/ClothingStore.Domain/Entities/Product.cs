namespace ClothingStore.Domain.Entities;

public class Product : SoftDeletableEntity, IAuditableEntity
{
	public string Name { get; set; } = string.Empty;
	public string ProductCode { get; set; } = string.Empty;
	public string Slug { get; set; } = string.Empty;
	public string Description { get; set; } = string.Empty;
	public string? DescriptionHtml { get; set; }
	public string? DescriptionJson { get; set; }
	public decimal Price { get; set; }
	public decimal? SalePrice { get; set; }
	public DateTime? SalePriceStartDate { get; set; }
	public DateTime? SalePriceEndDate { get; set; }
	public int SoldCount { get; set; }
	public double AverageRating { get; set; }
	public int ReviewCount { get; set; }
	public Guid CategoryId { get; set; }
	public bool IsActive { get; set; } = true;
	public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
	public Category? Category { get; set; }
	public ICollection<ProductVariant> Variants { get; set; } = [];
}
