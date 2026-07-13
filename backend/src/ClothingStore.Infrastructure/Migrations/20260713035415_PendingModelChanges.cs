using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerTierChangeLogs_Users_ChangedById",
                table: "CustomerTierChangeLogs"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerTierChangeLogs_Users_ChangedById",
                table: "CustomerTierChangeLogs",
                column: "ChangedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerTierChangeLogs_Users_ChangedById",
                table: "CustomerTierChangeLogs"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerTierChangeLogs_Users_ChangedById",
                table: "CustomerTierChangeLogs",
                column: "ChangedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}
