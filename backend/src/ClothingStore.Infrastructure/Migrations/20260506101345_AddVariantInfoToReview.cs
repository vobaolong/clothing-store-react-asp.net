using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVariantInfoToReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VariantColor",
                table: "Reviews",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "VariantSize",
                table: "Reviews",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "VariantColor", table: "Reviews");

            migrationBuilder.DropColumn(name: "VariantSize", table: "Reviews");
        }
    }
}
