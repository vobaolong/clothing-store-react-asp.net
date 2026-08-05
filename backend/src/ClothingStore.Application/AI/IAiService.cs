using ClothingStore.Application.AI.Dtos;

namespace ClothingStore.Application.AI;

public interface IAiService
{
    Task<ChatResponseDto> ChatAsync(ChatRequestDto request, CancellationToken ct = default);
}
