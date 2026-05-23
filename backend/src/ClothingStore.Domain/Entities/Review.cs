namespace ClothingStore.Domain.Entities;

public class Review : BaseEntity, IAuditableEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid? OrderItemId { get; set; }
    public OrderItem? OrderItem { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? Tags { get; set; }
    public string? VariantSize { get; set; }
    public string? VariantColor { get; set; }
    public DateTime UpdatedAt { get; set; }
}
