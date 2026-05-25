using ClothingStore.Domain.Enums;

namespace ClothingStore.Application.ShippingAddresses;

public record ShippingAddressDto(
    Guid Id,
    string FullName,
    string Phone,
    string Province,
    string ProvinceId,
    string Ward,
    string WardCode,
    string Street,
    ShippingAddressLabel? Label,
    bool IsDefault,
    DateTime CreatedAt,
    string FullAddress
);
