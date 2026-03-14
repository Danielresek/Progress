import { useAuth0 } from "@auth0/auth0-react";
import {
  createLog as createLogRequest,
  completeWorkoutDay as completeWorkoutDayRequest,
  createPlan as createPlanRequest,
  getActivePlan as getActivePlanRequest,
  getLogs as getLogsRequest,
  getWeeklyStats as getWeeklyStatsRequest,
  resetLogs as resetLogsRequest,
  resetActivePlan as resetActivePlanRequest,
  updateActivePlanDay as updateActivePlanDayRequest,
  type CompleteWorkoutDayRequest,
  type CompleteWorkoutDayResponse,
  type CreatePlanRequest,
  type CreateWorkoutLogRequest,
  type PlanResponse,
  type UpdatePlanDayRequest,
  type WeeklyStatsResponse,
  type WorkoutLogResponse,
} from "./workoutApi";

export function useWorkoutApi() {
  const { getAccessTokenSilently } = useAuth0();

  async function getToken(): Promise<string> {
    return getAccessTokenSilently();
  }

  async function getActivePlan(): Promise<PlanResponse | null> {
    const token = await getToken();
    try {
      return await getActivePlanRequest(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("(404") || message.includes(" 404 ")) {
        return null;
      }

      throw error;
    }
  }

  async function createPlan(payload: CreatePlanRequest): Promise<PlanResponse> {
    const token = await getToken();
    return createPlanRequest(token, payload);
  }

  async function resetActivePlan(): Promise<void> {
    const token = await getToken();
    await resetActivePlanRequest(token);
  }

  async function updateActivePlanDay(
    dayIndex: number,
    payload: UpdatePlanDayRequest
  ): Promise<PlanResponse> {
    const token = await getToken();
    return updateActivePlanDayRequest(token, dayIndex, payload);
  }

  async function getLogs(): Promise<WorkoutLogResponse[]> {
    const token = await getToken();
    return getLogsRequest(token);
  }

  async function resetLogs(): Promise<void> {
    const token = await getToken();
    await resetLogsRequest(token);
  }

  async function createLog(
    payload: CreateWorkoutLogRequest
  ): Promise<WorkoutLogResponse> {
    const token = await getToken();
    return createLogRequest(token, payload);
  }

  async function getWeeklyStats(): Promise<WeeklyStatsResponse> {
    const token = await getToken();
    return getWeeklyStatsRequest(token);
  }

  async function completeWorkoutDay(
    payload: CompleteWorkoutDayRequest
  ): Promise<CompleteWorkoutDayResponse> {
    const token = await getToken();
    return completeWorkoutDayRequest(token, payload);
  }

  return {
    getActivePlan,
    createPlan,
    resetActivePlan,
    updateActivePlanDay,
    getLogs,
    resetLogs,
    createLog,
    getWeeklyStats,
    completeWorkoutDay,
  };
}
