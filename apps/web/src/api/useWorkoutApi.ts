import { useAuth0 } from "@auth0/auth0-react";
import {
  createLog as createLogRequest,
  createPlan as createPlanRequest,
  getActivePlan as getActivePlanRequest,
  getLogs as getLogsRequest,
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

  async function getActivePlan(): Promise<PlanResponse> {
    const token = await getToken();
    return getActivePlanRequest(token);
  }

  async function createPlan(payload: CreatePlanRequest): Promise<PlanResponse> {
    const token = await getToken();
    return createPlanRequest(token, payload);
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
    getLogs,
    createLog,
  };
}
