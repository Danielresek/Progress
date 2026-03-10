import { useAuth0 } from "@auth0/auth0-react";
import {
  createLog as createLogRequest,
  createPlan as createPlanRequest,
  getActivePlan as getActivePlanRequest,
  getLogs as getLogsRequest,
  resetActivePlan as resetActivePlanRequest,
  type CreatePlanRequest,
  type CreateWorkoutLogRequest,
  type PlanResponse,
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

  async function getLogs(): Promise<WorkoutLogResponse[]> {
    const token = await getToken();
    return getLogsRequest(token);
  }

  async function createLog(
    payload: CreateWorkoutLogRequest
  ): Promise<WorkoutLogResponse> {
    const token = await getToken();
    return createLogRequest(token, payload);
  }

  return {
    getActivePlan,
    createPlan,
    resetActivePlan,
    getLogs,
    createLog,
  };
}
