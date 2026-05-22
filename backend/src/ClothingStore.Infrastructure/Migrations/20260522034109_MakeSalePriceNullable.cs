using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeSalePriceNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "SalePrice",
                table: "Products",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            // Backfill: convert SalePrice = 0 to NULL (0 was used to indicate "no sale")
            // Products with an actual sale price of 0đ (free) are preserved manually if needed.
            migrationBuilder.Sql(
                "UPDATE \"Products\" SET \"SalePrice\" = NULL WHERE \"SalePrice\" = 0;"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert backfill: set NULL back to 0 before altering column back
            migrationBuilder.Sql(
                "UPDATE \"Products\" SET \"SalePrice\" = 0 WHERE \"SalePrice\" IS NULL;"
            );

            migrationBuilder.AlterColumn<decimal>(
                name: "SalePrice",
                table: "Products",
                type: "numeric",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);
        }
    }
}
