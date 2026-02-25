namespace WorkoutApp.Models;

public class Workout
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = default!; // Auth0 sub

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public string Title { get; set; } = default!;
}