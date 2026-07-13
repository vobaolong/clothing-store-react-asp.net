using ClothingStore.Domain.Enums;

namespace ClothingStore.Domain.Entities;

public class CustomerTierChangeLog : BaseEntity
{
    public Guid CustomerId { get; set; }
    public User Customer { get; set; } = null!;
    public Guid? ChangedById { get; set; }
    public User? ChangedBy { get; set; }
    public CustomerTier FromTier { get; set; }
    public CustomerTier ToTier { get; set; }
    public string? Reason { get; set; }
}
