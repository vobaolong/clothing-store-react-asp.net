using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerTier : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tier",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "Bronze");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalSpent",
                table: "Users",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "CustomerTierChangeLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChangedById = table.Column<Guid>(type: "uuid", nullable: false),
                    FromTier = table.Column<int>(type: "integer", nullable: false),
                    ToTier = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTierChangeLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerTierChangeLogs_Users_ChangedById",
                        column: x => x.ChangedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerTierChangeLogs_Users_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTierChangeLogs_ChangedById",
                table: "CustomerTierChangeLogs",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTierChangeLogs_CustomerId",
                table: "CustomerTierChangeLogs",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerTierChangeLogs");

            migrationBuilder.DropColumn(
                name: "Tier",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TotalSpent",
                table: "Users");
        }
    }
}
