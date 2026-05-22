namespace ClothingStore.API.Services;

public interface IConnectionManager
{
	Task AddConnectionAsync(Guid userId, string connectionId, bool isAdmin = false);
	Task RemoveConnectionAsync(Guid userId, string connectionId);
	Task<IReadOnlyList<string>> GetUserConnectionsAsync(Guid userId);
	Task<IReadOnlyList<string>> GetAdminConnectionsAsync();
	Task<bool> IsUserOnlineAsync(Guid userId);
	Task<int> GetOnlineUsersCountAsync();
	Task<int> GetOnlineAdminsCountAsync();
}