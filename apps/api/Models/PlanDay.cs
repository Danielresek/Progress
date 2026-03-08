namespace WorkoutApp.Models;

public class PlanDay
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PlanId { get; set; }

    public string Name { get; set; } = default!;

    public int DayIndex { get; set; }

    public Plan Plan { get; set; } = default!;

    public List<PlanDayExercise> Exercises { get; set; } = new();
}
