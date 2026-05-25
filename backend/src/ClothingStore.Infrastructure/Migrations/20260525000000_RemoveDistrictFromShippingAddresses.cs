using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClothingStore.Infrastructure.Migrations;

public partial class RemoveDistrictFromShippingAddresses : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "District", table: "ShippingAddresses");
        migrationBuilder.DropColumn(name: "DistrictId", table: "ShippingAddresses");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "District",
            table: "ShippingAddresses",
            type: "text",
            nullable: false,
            defaultValue: string.Empty
        );

        migrationBuilder.AddColumn<string>(
            name: "DistrictId",
            table: "ShippingAddresses",
            type: "text",
            nullable: false,
            defaultValue: string.Empty
        );
    }
}
