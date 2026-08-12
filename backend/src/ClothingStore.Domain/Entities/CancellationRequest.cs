using ClothingStore.Domain.Enums;

namespace ClothingStore.Domain.Entities;

public class CancellationRequest : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Note { get; set; }
    public CancellationRequestStatus Status { get; set; } = CancellationRequestStatus.Pending;
    public Guid? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? RejectionReason { get; set; }
}
