namespace ClothingStore.Domain.Entities;

public abstract class SoftDeletableEntity : BaseEntity
{
	public DateTime? DeletedAt { get; set; }
}
