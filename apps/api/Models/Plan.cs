namespace WorkoutApp.Models;

public class Plan
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = default!; // Auth0 sub

    public string Name { get; set; } = default!;

    public bool IsActive { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<PlanDay> Days { get; set; } = new();
}
