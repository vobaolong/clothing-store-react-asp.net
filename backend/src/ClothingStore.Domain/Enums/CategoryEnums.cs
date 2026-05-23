using System.Text.Json.Serialization;

namespace ClothingStore.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Gender
{
    Unisex,
    Male,
    Female,
    Kid,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProductType
{
    Clothing,
    Shoes,
    Accessories,
}
