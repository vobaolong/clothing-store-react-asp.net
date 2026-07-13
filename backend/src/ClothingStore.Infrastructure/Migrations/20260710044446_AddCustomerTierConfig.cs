using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerTierConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomerTierConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Tier = table.Column<string>(type: "text", nullable: false),
                    MinSpend = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    FreeShipping = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTierConfigs", x => x.Id);
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTierConfigs_Tier",
                table: "CustomerTierConfigs",
                column: "Tier",
                unique: true
            );

            var now = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            migrationBuilder.InsertData(
                table: "CustomerTierConfigs",
                columns: ["Id", "Tier", "MinSpend", "DiscountPercent", "FreeShipping", "CreatedAt"],
                values: new object[,]
                {
                    { Guid.NewGuid(), "Bronze", 0m, 0m, false, now },
                    { Guid.NewGuid(), "Silver", 3_000_000m, 5m, true, now },
                    { Guid.NewGuid(), "Gold", 8_000_000m, 10m, true, now },
                    { Guid.NewGuid(), "Platinum", 15_000_000m, 12m, true, now },
                    { Guid.NewGuid(), "Diamond", 25_000_000m, 15m, true, now },
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "CustomerTierConfigs");
        }
    }
}
