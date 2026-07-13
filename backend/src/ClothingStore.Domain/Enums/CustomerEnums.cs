using System.Text.Json.Serialization;

namespace ClothingStore.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CustomerTier
{
    Bronze,
    Silver,
    Gold,
    Platinum,
    Diamond,
}
