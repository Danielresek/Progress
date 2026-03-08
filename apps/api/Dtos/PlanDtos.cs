namespace WorkoutApp.Dtos;

public record CreatePlanRequest(
    string Name,
    List<CreatePlanDayRequest> Days);

public record CreatePlanDayRequest(
    string Name,
    int DayIndex,
    List<CreatePlanDayExerciseRequest> Exercises);

public record CreatePlanDayExerciseRequest(
    string ExerciseId,
    string ExerciseName,
    int SortOrder,
    int Sets,
    int Reps,
    decimal StartWeight);

public record PlanResponse(
    Guid Id,
    string Name,
    bool IsActive,
    List<PlanDayResponse> Days);

public record PlanDayResponse(
    Guid Id,
    int DayIndex,
    string Name,
    List<PlanDayExerciseResponse> Exercises);

public record PlanDayExerciseResponse(
    Guid Id,
    string ExerciseId,
    string ExerciseName,
    int SortOrder,
    int Sets,
    int Reps,
    decimal StartWeight);