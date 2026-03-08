using Microsoft.EntityFrameworkCore;
using WorkoutApp.Models;

namespace WorkoutApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<PlanDay> PlanDays => Set<PlanDay>();
    public DbSet<PlanDayExercise> PlanDayExercises => Set<PlanDayExercise>();
    public DbSet<WorkoutLog> WorkoutLogs => Set<WorkoutLog>();
    public DbSet<UserProgress> UserProgressEntries => Set<UserProgress>();
}