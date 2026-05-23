using System.Text.Json.Serialization;

namespace ClothingStore.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CouponDiscountType
{
    Flat,
    Percent,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CouponStatus
{
    Active,
    Inactive,
    Archived,
}
