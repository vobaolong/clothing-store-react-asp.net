using ClothingStore.Domain.Enums;

namespace ClothingStore.Domain.Entities;

public class CustomerTierConfig : BaseEntity
{
    public CustomerTier Tier { get; set; }
    public decimal MinSpend { get; set; }
    public decimal DiscountPercent { get; set; }
    public bool FreeShipping { get; set; }
}
