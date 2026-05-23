using System.Collections.Concurrent;

namespace ClothingStore.API.Services;

public class ConnectionManager : IConnectionManager
{
    private readonly ConcurrentDictionary<Guid, HashSet<string>> _userConnections = new();
    private readonly ConcurrentDictionary<string, Guid> _connectionUsers = new();
    private readonly ConcurrentDictionary<Guid, bool> _adminUsers = new();
    private readonly Lock _lock = new();

    public Task AddConnectionAsync(Guid userId, string connectionId, bool isAdmin = false)
    {
        lock (_lock)
        {
            _userConnections.AddOrUpdate(
                userId,
                new HashSet<string> { connectionId },
                (key, existing) =>
                {
                    existing.Add(connectionId);
                    return existing;
                }
            );

            _connectionUsers[connectionId] = userId;

            if (isAdmin)
            {
                _adminUsers[userId] = true;
            }
        }

        return Task.CompletedTask;
    }

    public Task RemoveConnectionAsync(Guid userId, string connectionId)
    {
        lock (_lock)
        {
            _connectionUsers.TryRemove(connectionId, out _);

            if (_userConnections.TryGetValue(userId, out var connections))
            {
                connections.Remove(connectionId);

                if (connections.Count == 0)
                {
                    _userConnections.TryRemove(userId, out _);
                    _adminUsers.TryRemove(userId, out _);
                }
            }
        }

        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<string>> GetUserConnectionsAsync(Guid userId)
    {
        lock (_lock)
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                return Task.FromResult<IReadOnlyList<string>>(connections.ToList());
            }

            return Task.FromResult<IReadOnlyList<string>>(Array.Empty<string>());
        }
    }

    public Task<IReadOnlyList<string>> GetAdminConnectionsAsync()
    {
        lock (_lock)
        {
            var adminConnections = new List<string>();

            foreach (var (userId, isAdmin) in _adminUsers)
            {
                if (isAdmin && _userConnections.TryGetValue(userId, out var connections))
                {
                    adminConnections.AddRange(connections);
                }
            }

            return Task.FromResult<IReadOnlyList<string>>(adminConnections);
        }
    }

    public Task<bool> IsUserOnlineAsync(Guid userId)
    {
        lock (_lock)
        {
            return Task.FromResult(_userConnections.ContainsKey(userId));
        }
    }

    public Task<int> GetOnlineUsersCountAsync()
    {
        lock (_lock)
        {
            return Task.FromResult(_userConnections.Count);
        }
    }

    public Task<int> GetOnlineAdminsCountAsync()
    {
        lock (_lock)
        {
            return Task.FromResult(
                _adminUsers.Count(x => x.Value && _userConnections.ContainsKey(x.Key))
            );
        }
    }
}
