namespace ClothingStore.Application.Auth.Dtos;

public record LoginResponseDto(string Token, string? RememberMeToken);
