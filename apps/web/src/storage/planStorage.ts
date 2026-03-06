import type { DayExercise, Plan } from "../types";
import {
  CURRENT_DAY_KEY,
  PLAN_COMPLETE_KEY,
  PLAN_KEY,
} from "./keys";

function getDayKey(dayIndex: number) {
  return `workouttracker.plan.day.${dayIndex}.v1`;
}

function getRunKey(dayIndex: number) {
  return `workouttracker.run.day.${dayIndex}.v1`;
}

export function getPlan(): Plan | null {
  const raw = localStorage.getItem(PLAN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !Array.isArray(parsed.days)) return null;
    return parsed as Plan;
  } catch {
    return null;
  }
}

export function savePlan(plan: Plan) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function clearPlan() {
  localStorage.removeItem(PLAN_KEY);
}

export function getDayExercises(dayIndex: number): DayExercise[] {
  const raw = localStorage.getItem(getDayKey(dayIndex));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DayExercise[]) : [];
  } catch {
    return [];
  }
}

export function saveDayExercises(dayIndex: number, exercises: DayExercise[]) {
  localStorage.setItem(getDayKey(dayIndex), JSON.stringify(exercises));
}

export function clearDayExercises(dayIndex: number) {
  localStorage.removeItem(getDayKey(dayIndex));
}

export function getCurrentDay(): number {
  const raw = localStorage.getItem(CURRENT_DAY_KEY);
  const parsed = Number(raw);
  return !Number.isNaN(parsed) && parsed > 0 ? parsed : 1;
}

export function setCurrentDay(dayIndex: number) {
  localStorage.setItem(CURRENT_DAY_KEY, String(dayIndex));
}

export function clearCurrentDay() {
  localStorage.removeItem(CURRENT_DAY_KEY);
}

export function isPlanComplete() {
  return localStorage.getItem(PLAN_COMPLETE_KEY) === "1";
}

export function clearPlanComplete() {
  localStorage.removeItem(PLAN_COMPLETE_KEY);
}

export function getRunIndex(dayIndex: number): number | null {
  const raw = localStorage.getItem(getRunKey(dayIndex));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.index === "number" ? parsed.index : null;
  } catch {
    return null;
  }
}

export function setRunIndex(dayIndex: number, index: number) {
  localStorage.setItem(getRunKey(dayIndex), JSON.stringify({ index }));
}

export function clearRunState(dayIndex: number) {
  localStorage.removeItem(getRunKey(dayIndex));
}
