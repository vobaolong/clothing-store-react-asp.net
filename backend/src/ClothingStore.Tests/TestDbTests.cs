using ClothingStore.Tests;
using Xunit;

namespace ClothingStore.Tests;

public class TestDbTests
{
    [Fact]
    public void Create_Returns_DbContext()
    {
        using var db = TestDb.Create();
        Assert.NotNull(db);
    }
}
