using ClothingStore.Domain.Enums;

namespace ClothingStore.Domain.Entities;

public class ShippingAddress : SoftDeletableEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string ProvinceId { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string DistrictId { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string WardCode { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public ShippingAddressLabel? Label { get; set; }
    public bool IsDefault { get; set; }
}
