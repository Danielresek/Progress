import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkoutApi } from "../api/useWorkoutApi";
import type { PlanResponse } from "../api/workoutApi";

let activePlanCache: PlanResponse | null = null;
let hasResolvedActivePlan = false;
let activePlanRequest: Promise<PlanResponse | null> | null = null;

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("(404");
}

export function useActivePlan() {
  const { getActivePlan } = useWorkoutApi();
  const isMountedRef = useRef(true);

  const [plan, setPlan] = useState<PlanResponse | null>(
    hasResolvedActivePlan ? activePlanCache : null
  );
  const [isLoading, setIsLoading] = useState(!hasResolvedActivePlan);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(
    async (force = false) => {
      if (!force && hasResolvedActivePlan) {
        if (isMountedRef.current) {
          setPlan(activePlanCache);
          setIsLoading(false);
          setError(null);
        }
        return activePlanCache;
      }

      if (isMountedRef.current) {
        setIsLoading(true);
        setError(null);
      }

      if (!activePlanRequest || force) {
        activePlanRequest = (async () => {
          try {
            const nextPlan = await getActivePlan();
            activePlanCache = nextPlan;
            hasResolvedActivePlan = true;
            return nextPlan;
          } catch (err) {
            if (isNotFoundError(err)) {
              activePlanCache = null;
              hasResolvedActivePlan = true;
              return null;
            }
            throw err;
          }
        })();
      }

      try {
        const nextPlan = await activePlanRequest;
        if (isMountedRef.current) {
          setPlan(nextPlan);
          setError(null);
        }
        return nextPlan;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load active plan";
        if (isMountedRef.current) {
          setError(message);
        }
        return null;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        activePlanRequest = null;
      }
    },
    [getActivePlan]
  );

  useEffect(() => {
    isMountedRef.current = true;

    const run = async () => {
      await loadPlan(false);
    };

    void run();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadPlan]);

  const refreshPlan = useCallback(async () => {
    return loadPlan(true);
  }, [loadPlan]);

  return {
    plan,
    isLoading,
    error,
    refreshPlan,
  };
}
