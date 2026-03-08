using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkoutApp.Migrations
{
    /// <inheritdoc />
    public partial class AddCoreWorkoutModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserProgressEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    CurrentDayIndex = table.Column<int>(type: "integer", nullable: false),
                    CurrentWeekIndex = table.Column<int>(type: "integer", nullable: false),
                    WeeklyStreak = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProgressEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanDays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    DayIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanDays_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanDayExercises",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanDayId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExerciseId = table.Column<string>(type: "text", nullable: false),
                    ExerciseName = table.Column<string>(type: "text", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Sets = table.Column<int>(type: "integer", nullable: false),
                    Reps = table.Column<int>(type: "integer", nullable: false),
                    StartWeight = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanDayExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanDayExercises_PlanDays_PlanDayId",
                        column: x => x.PlanDayId,
                        principalTable: "PlanDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    PlanDayId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanDayName = table.Column<string>(type: "text", nullable: false),
                    ExerciseId = table.Column<string>(type: "text", nullable: false),
                    ExerciseName = table.Column<string>(type: "text", nullable: false),
                    PerformedWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    PerformedReps = table.Column<int>(type: "integer", nullable: false),
                    WeekIndex = table.Column<int>(type: "integer", nullable: false),
                    LoggedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutLogs_PlanDays_PlanDayId",
                        column: x => x.PlanDayId,
                        principalTable: "PlanDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlanDayExercises_PlanDayId",
                table: "PlanDayExercises",
                column: "PlanDayId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanDays_PlanId",
                table: "PlanDays",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutLogs_PlanDayId",
                table: "WorkoutLogs",
                column: "PlanDayId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanDayExercises");

            migrationBuilder.DropTable(
                name: "UserProgressEntries");

            migrationBuilder.DropTable(
                name: "WorkoutLogs");

            migrationBuilder.DropTable(
                name: "PlanDays");

            migrationBuilder.DropTable(
                name: "Plans");
        }
    }
}
