using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SprintTracker.backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSprintSessionCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SessionCode",
                table: "Sprints",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE \"Sprints\" SET \"SessionCode\" = upper(substr(md5(random()::text || \"Id\"::text || clock_timestamp()::text), 1, 8));");

            migrationBuilder.AlterColumn<string>(
                name: "SessionCode",
                table: "Sprints",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(16)",
                oldMaxLength: 16,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_SessionCode",
                table: "Sprints",
                column: "SessionCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sprints_SessionCode",
                table: "Sprints");

            migrationBuilder.DropColumn(
                name: "SessionCode",
                table: "Sprints");
        }
    }
}