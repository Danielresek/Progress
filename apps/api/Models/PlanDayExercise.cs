namespace WorkoutApp.Models;

public class PlanDayExercise
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PlanDayId { get; set; }

    public string ExerciseId { get; set; } = default!;

    public string ExerciseName { get; set; } = default!;

    public int SortOrder { get; set; }

    public int Sets { get; set; }

    public int Reps { get; set; }

    public decimal StartWeight { get; set; }

    public PlanDay PlanDay { get; set; } = default!;
}
