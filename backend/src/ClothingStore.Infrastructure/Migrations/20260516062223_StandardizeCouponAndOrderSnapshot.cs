using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StandardizeCouponAndOrderSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Coupons");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Coupons");

            migrationBuilder.RenameColumn(
                name: "CouponCode",
                table: "Orders",
                newName: "CouponCodeSnapshot");

            migrationBuilder.AddColumn<int>(
                name: "CouponDiscountTypeSnapshot",
                table: "Orders",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CouponDiscountValueSnapshot",
                table: "Orders",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Coupons",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CouponDiscountTypeSnapshot",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CouponDiscountValueSnapshot",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Coupons");

            migrationBuilder.RenameColumn(
                name: "CouponCodeSnapshot",
                table: "Orders",
                newName: "CouponCode");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Coupons",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Coupons",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
