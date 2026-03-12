import { apiFetch } from "./client";

export type CreatePlanDayExerciseRequest = {
  exerciseId: string;
  exerciseName: string;
  sortOrder: number;
  sets: number;
  reps: number;
  startWeight: number;
};

export type CreatePlanDayRequest = {
  name: string;
  dayIndex: number;
  exercises: CreatePlanDayExerciseRequest[];
};

export type CreatePlanRequest = {
  name: string;
  days: CreatePlanDayRequest[];
};

export type UpdatePlanDayExerciseRequest = {
  exerciseId: string;
  exerciseName: string;
  sortOrder: number;
  sets: number;
  reps: number;
  startWeight: number;
};

export type UpdatePlanDayRequest = {
  name: string;
  exercises: UpdatePlanDayExerciseRequest[];
};

export type PlanDayExerciseResponse = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sortOrder: number;
  sets: number;
  reps: number;
  startWeight: number;
};

export type PlanDayResponse = {
  id: string;
  dayIndex: number;
  name: string;
  exercises: PlanDayExerciseResponse[];
};

export type PlanResponse = {
  id: string;
  name: string;
  isActive: boolean;
  days: PlanDayResponse[];
};

export type CreateWorkoutLogRequest = {
  planDayId: string;
  planDayName: string;
  exerciseId: string;
  exerciseName: string;
  exerciseSessionId: string;
  setNumber: number;
  performedWeight: number;
  performedReps: number;
  weekIndex: number;
};

export type WorkoutLogResponse = {
  id: string;
  planDayId: string;
  planDayName: string;
  exerciseId: string;
  exerciseName: string;
  exerciseSessionId: string;
  setNumber: number;
  performedWeight: number;
  performedReps: number;
  weekIndex: number;
  loggedAtUtc: string;
};

export function getActivePlan(token: string): Promise<PlanResponse> {
  return apiFetch<PlanResponse>("/api/plans/active", token, {
    method: "GET",
  });
}

export function createPlan(
  token: string,
  payload: CreatePlanRequest
): Promise<PlanResponse> {
  return apiFetch<PlanResponse>("/api/plans", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetActivePlan(token: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/api/plans/reset", token, {
    method: "POST",
  });
}

export function updateActivePlanDay(
  token: string,
  dayIndex: number,
  payload: UpdatePlanDayRequest
): Promise<PlanResponse> {
  return apiFetch<PlanResponse>(`/api/plans/active/days/${dayIndex}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getLogs(token: string): Promise<WorkoutLogResponse[]> {
  return apiFetch<WorkoutLogResponse[]>("/api/logs", token, {
    method: "GET",
  });
}

export function resetLogs(token: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/api/logs/reset", token, {
    method: "POST",
  });
}

export function createLog(
  token: string,
  payload: CreateWorkoutLogRequest
): Promise<WorkoutLogResponse> {
  return apiFetch<WorkoutLogResponse>("/api/logs", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
