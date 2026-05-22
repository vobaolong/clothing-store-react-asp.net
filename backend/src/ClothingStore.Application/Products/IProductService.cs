namespace ClothingStore.Application.Products;

public interface IProductService
{
	Task<Guid> CreateAsync(AdminProductUpsertDto dto, CancellationToken cancellationToken);
	Task<IReadOnlyList<AdminProductResponseDto>> GetAllAsync(CancellationToken cancellationToken);
	Task<IReadOnlyList<AdminProductResponseDto>> GetDeletedAsync(CancellationToken cancellationToken);
	Task<Guid> UpdateAsync(Guid id, AdminProductUpsertDto dto, CancellationToken cancellationToken);
	Task<AdminProductImportResultDto> ImportAsync(IReadOnlyList<AdminProductImportRowDto> rows, CancellationToken cancellationToken);
	Task RestoreAsync(Guid id, CancellationToken cancellationToken);
	Task<int> BulkRestoreAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken);
	Task DeletePermanentAsync(Guid id, CancellationToken cancellationToken);
	Task<int> BulkDeletePermanentAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken);
	Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken);
	Task<int> SoftDeleteBulkAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken);
	Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken);
	Task<int> BulkSetActiveAsync(IReadOnlyList<Guid> ids, bool isActive, CancellationToken cancellationToken);
}
