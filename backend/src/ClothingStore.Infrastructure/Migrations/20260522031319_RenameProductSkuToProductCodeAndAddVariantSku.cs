using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameProductSkuToProductCodeAndAddVariantSku : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Sku",
                table: "Products",
                newName: "ProductCode");

            migrationBuilder.AddColumn<string>(
                name: "Sku",
                table: "ProductVariants",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE \"ProductVariants\" SET \"Sku\" = UPPER(TRIM(BOTH '-' FROM REGEXP_REPLACE(COALESCE(\"ProductId\"::text, '') || '-' || COALESCE(\"Color\", '') || '-' || COALESCE(\"Size\", ''), '[^A-Za-z0-9]+', '-', 'g')));"
            );

            migrationBuilder.AlterColumn<string>(
                name: "Sku",
                table: "ProductVariants",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_Sku",
                table: "ProductVariants",
                column: "Sku",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductVariants_Sku",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "Sku",
                table: "ProductVariants");

            migrationBuilder.RenameColumn(
                name: "ProductCode",
                table: "Products",
                newName: "Sku");
        }
    }
}
