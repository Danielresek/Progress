namespace WorkoutApp.Models;

public class UserProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = default!; // Auth0 sub

    public int CurrentDayIndex { get; set; }

    public int CurrentWeekIndex { get; set; }

    public int WeeklyStreak { get; set; }

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
