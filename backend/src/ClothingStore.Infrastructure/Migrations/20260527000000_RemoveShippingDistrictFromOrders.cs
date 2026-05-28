using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations;

public partial class RemoveShippingDistrictFromOrders : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "ShippingDistrict", table: "Orders");
        migrationBuilder.DropColumn(name: "ShippingDistrictId", table: "Orders");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ShippingDistrict",
            table: "Orders",
            type: "text",
            nullable: false,
            defaultValue: string.Empty
        );

        migrationBuilder.AddColumn<string>(
            name: "ShippingDistrictId",
            table: "Orders",
            type: "text",
            nullable: false,
            defaultValue: string.Empty
        );
    }
}
