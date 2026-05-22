using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations;

public partial class AddCouponDiscountType : Migration
{
	protected override void Up(MigrationBuilder migrationBuilder)
	{
		migrationBuilder.AddColumn<string>(
			name: "DiscountType",
			table: "Coupons",
			type: "text",
			nullable: false,
			defaultValue: "Flat"
		);
	}

	protected override void Down(MigrationBuilder migrationBuilder)
	{
		migrationBuilder.DropColumn(
			name: "DiscountType",
			table: "Coupons"
		);
	}
}