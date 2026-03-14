namespace WorkoutApp.Dtos;

public record WeeklyStatsResponse(
    int CurrentDayIndex,
    int WeekIndex,
    int Streak,
    int TotalDays,
    int CompletedCount,
    int RemainingCount,
    int ProgressPct);

public record CompleteWorkoutDayRequest(int DayIndex);

public record CompleteWorkoutDayResponse(
    bool WeekJustCompleted,
    int NextDayIndex,
    WeeklyStatsResponse WeeklyStats);
