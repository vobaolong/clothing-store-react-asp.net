namespace ClothingStore.Domain.Entities;

public interface IAuditableEntity
{
    DateTime UpdatedAt { get; set; }
}
