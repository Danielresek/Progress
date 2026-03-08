using WorkoutApp.Models;

namespace WorkoutApp.Dtos;

public static class PlanMappings
{
    public static PlanResponse MapPlanResponse(Plan plan)
    {
        return new PlanResponse(
            plan.Id,
            plan.Name,
            plan.IsActive,
            plan.Days
                .OrderBy(day => day.DayIndex)
                .Select(day => new PlanDayResponse(
                    day.Id,
                    day.DayIndex,
                    day.Name,
                    day.Exercises
                        .OrderBy(exercise => exercise.SortOrder)
                        .Select(exercise => new PlanDayExerciseResponse(
                            exercise.Id,
                            exercise.ExerciseId,
                            exercise.ExerciseName,
                            exercise.SortOrder,
                            exercise.Sets,
                            exercise.Reps,
                            exercise.StartWeight
                        ))
                        .ToList()
                ))
                .ToList()
        );
    }
}