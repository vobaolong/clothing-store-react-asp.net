# Remember Me Feature — Implementation Plan

## Context

Login form already has "Remember Me" checkbox, but it only extends JWT expiry from 1h→7d. Token always stored in localStorage regardless. No server-side revocation, no token rotation, no session-only storage.

Goal: Proper Remember Me with short-lived JWT + opaque refresh token, token rotation, server-side revocation, different storage strategies.

## Architecture

```
[Login] ─── POST /api/auth/login ───→ Backend verifies credentials
  │                                     │
  │◄──── { jwt, rememberMeToken? } ────│ rememberMe=true → issue opaque token (SHA256 in DB)
  │                                     │
  ├─ rememberMe=true  → JWT → sessionStorage, token → localStorage
  └─ rememberMe=false → JWT → sessionStorage only

[On 401 / page load]
  sessionStorage JWT missing/expired
    → check localStorage for rememberMeToken
    → POST /api/auth/token/refresh { rememberMeToken }
    → new JWT returned, old token invalidated (rotation)

[Logout]
  → POST /api/auth/logout (with rememberMeToken)
  → server deletes token from DB
  → clear sessionStorage + localStorage
```

## Security properties

| Property | Implementation |
|---|---|
| No password in storage | Opaque crypto-random token, not password |
| Anti-replay | Token stored SHA256-hashed in DB |
| Token rotation | Each refresh invalidates old token, issues new one |
| Configurable expiry | `RememberMe:ExpiryDays` (default 30) |
| Server-side logout | DELETE token row from DB |
| Limited blast radius | JWT stays short-lived (1h) regardless of rememberMe |

## Files to change

### Backend (8 files)

1. **`Domain/Entities/RememberMeToken.cs`** — NEW entity
   ```csharp
   public class RememberMeToken
   {
       public Guid Id { get; set; }
       public Guid UserId { get; set; }
       public string TokenHash { get; set; }  // SHA256 of opaque token
       public DateTime ExpiresAt { get; set; }
       public bool IsUsed { get; set; }
       public DateTime CreatedAt { get; set; }
       public User User { get; set; }
   }
   ```

2. **`Infrastructure/Persistence/ApplicationDbContext.cs`** — Add `DbSet<RememberMeToken>`, configure entity (unique index on TokenHash, cascade delete with User)

3. **`Application/Common/Interfaces/IRememberMeTokenService.cs`** — NEW interface
   - `GenerateTokenAsync(User user, CancellationToken ct)` → returns opaque token string
   - `ValidateAndRotateAsync(string opaqueToken, CancellationToken ct)` → returns User? (null if invalid/expired)
   - `RevokeAllForUserAsync(Guid userId, CancellationToken ct)`

4. **`Infrastructure/Security/RememberMeTokenService.cs`** — NEW implementation
   - Generate: `RandomNumberGenerator.GetBytes(32)` → base64url → SHA256 hash → store in DB
   - Validate: hash input → find in DB → check !IsUsed + !Expired → mark IsUsed=true → issue new one (rotation)
   - Configurable expiry from `RememberMe:ExpiryDays` (default 30)

5. **`Application/Auth/Dtos/LoginResponseDto.cs`** — NEW DTO
   ```csharp
   public record LoginResponseDto(string Token, string? RememberMeToken);
   ```

6. **`Application/Auth/Commands/LoginUserCommand.cs`** — Change return type from `IRequest<string>` to `IRequest<LoginResponseDto>`

7. **`Application/Auth/Commands/LoginUserCommandHandler.cs`** — After successful login, if `request.RememberMe`, call `IRememberMeTokenService.GenerateTokenAsync()`, include `RememberMeToken` in response

8. **`Application/Auth/Commands/RefreshTokenCommand.cs`** + **Handler** — NEW
   - `record RefreshTokenCommand(string RememberMeToken) : IRequest<LoginResponseDto>`
   - Handler: validate token → generate new JWT + rotate remember-me token → return `LoginResponseDto`

9. **`Application/Auth/Commands/LogoutCommand.cs`** + **Handler** — NEW
   - `record LogoutCommand(Guid UserId) : IRequest`
   - Handler: `rememberMeTokenService.RevokeAllForUserAsync(userId)`

10. **`API/Controllers/AuthController.cs`** — Add endpoints:
    - `POST /api/auth/token/refresh` — `RefreshTokenCommand`
    - `POST /api/auth/logout` — `LogoutCommand` (requires auth)

11. **`Application/Auth/Validators/RefreshTokenCommandValidator.cs`** — NEW, validate token not empty

12. **`API/Program.cs`** — Register `IRememberMeTokenService`

13. **`Infrastructure/DependencyInjection.cs`** — Register `RememberMeTokenService`

14. **`API/appsettings.json`** — Add `RememberMe:ExpiryDays: 30` (override `Jwt:RememberMeExpiryDays`)

### Frontend (5 files)

15. **`constants/storage-keys.constant.ts`** — Add `rememberMeToken: 'rememberMeToken'`

16. **`state/auth/auth-session.ts`** — Add:
    - `getRememberMeToken()` / `setRememberMeToken()` / `removeRememberMeToken()` → localStorage
    - Change `getAuthToken()` → sessionStorage (was localStorage)
    - Change `setAuthToken()` → sessionStorage
    - Change `removeAuthToken()` → sessionStorage
    - Add `getStoredToken()`: try sessionStorage first, fall back to refresh flow

17. **`state/auth/auth-slice.ts`** — Update `setAuth` to also handle `rememberMeToken` from login response

18. **`pages/LoginPage.tsx`** — On success: if `rememberMeToken` in response, store it in localStorage

19. **`api/auth-api.ts`** — Add:
    - `refreshToken(rememberMeToken: string): Promise<LoginResponseDto>`
    - `logout(): Promise<void>`
    - Update `login()` return type from `string` to `LoginResponseDto`

20. **`api/api-client.ts`** — Add response interceptor logic:
    - On 401, if `rememberMeToken` exists in localStorage, call refresh endpoint
    - If refresh succeeds, retry original request
    - If refresh fails, clear all storage, redirect to login

21. **`routes/ProtectedRoute.tsx`** — On mount, if no JWT in sessionStorage but rememberMeToken exists, trigger refresh flow

## Migration

```bash
dotnet ef migrations add AddRememberMeToken
dotnet ef database update
```

## Verification

1. Login without "Remember Me" → close tab → reopen → should be redirected to login
2. Login with "Remember Me" → close tab → reopen → should be auto-authenticated
3. Check DB: `RememberMeTokens` table has hashed token row
4. Logout → check DB: token row deleted → reopen tab → redirected to login
5. Attempt replay: copy rememberMeToken from localStorage → try to reuse → should fail (token marked Used)
6. Expiry: set `RememberMe:ExpiryDays` to 0 → login → token expires immediately → auto-refresh fails
