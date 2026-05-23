namespace ClothingStore.Domain.Entities;

public class Banner : SoftDeletableEntity
{
    public string ImageUrl { get; set; } = string.Empty;
    public string CtaLink { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
}
