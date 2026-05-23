using ClothingStore.Domain.Enums;

namespace ClothingStore.Domain.Entities;

public class Category : SoftDeletableEntity, IAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public Category? Parent { get; set; }
    public ICollection<Category> Children { get; set; } = [];
    public byte Level { get; set; } = 0;
    public Gender Gender { get; set; } = Gender.Unisex;
    public ProductType? ProductType { get; set; }
    public string? Image { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime UpdatedAt { get; set; }
    public ICollection<Product> Products { get; set; } = []; //[]
}
