using WorkoutApp.Models;

namespace WorkoutApp.Dtos;

public static class WorkoutLogMappings
{
    public static WorkoutLogResponse MapWorkoutLogResponse(WorkoutLog log)
    {
        return new WorkoutLogResponse(
            log.Id,
            log.PlanDayId,
            log.PlanDayName,
            log.ExerciseId,
            log.ExerciseName,
            log.ExerciseSessionId,
            log.SetNumber,
            log.PerformedWeight,
            log.PerformedReps,
            log.WeekIndex,
            log.LoggedAtUtc
        );
    }
}