namespace WorkoutApp.Models;

public class WorkoutLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = default!; // Auth0 sub

    public Guid PlanDayId { get; set; }

    public string PlanDayName { get; set; } = default!;

    public string ExerciseId { get; set; } = default!;

    public string ExerciseName { get; set; } = default!;

    public decimal PerformedWeight { get; set; }

    public int PerformedReps { get; set; }

    public int WeekIndex { get; set; }

    public DateTime LoggedAtUtc { get; set; } = DateTime.UtcNow;

    public PlanDay PlanDay { get; set; } = default!;
}
