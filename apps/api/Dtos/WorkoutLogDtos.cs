namespace WorkoutApp.Dtos;

public record CreateWorkoutLogRequest(
    Guid PlanDayId,
    string PlanDayName,
    string ExerciseId,
    string ExerciseName,
    decimal PerformedWeight,
    int PerformedReps,
    int WeekIndex);

public record WorkoutLogResponse(
    Guid Id,
    Guid PlanDayId,
    string PlanDayName,
    string ExerciseId,
    string ExerciseName,
    decimal PerformedWeight,
    int PerformedReps,
    int WeekIndex,
    DateTime LoggedAtUtc);