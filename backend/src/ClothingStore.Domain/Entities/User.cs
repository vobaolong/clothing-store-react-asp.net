namespace ClothingStore.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public bool IsLocked { get; set; }
    public string? ResetPasswordToken { get; set; }
    public DateTime? ResetPasswordTokenExpiresAt { get; set; }
    public bool IsEmailVerified { get; set; }
    public string? EmailVerificationOtpHash { get; set; }
    public DateTime? EmailVerificationOtpExpiresAt { get; set; }
}
