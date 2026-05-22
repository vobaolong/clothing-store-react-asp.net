using System.Security.Cryptography;
using System.Text;
using ClothingStore.Application.Common.Interfaces;

namespace ClothingStore.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
	public string Hash(string password)
			=> Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(password)));

	public bool Verify(string password, string hash)
			=> Hash(password).Equals(hash, StringComparison.OrdinalIgnoreCase);
}
