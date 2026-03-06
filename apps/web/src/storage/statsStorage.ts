import type { WeekCompletion } from "../types";
import {
  WEEK_COMPLETIONS_KEY,
  WEEK_DONE_KEY,
  WEEK_INDEX_KEY,
  WEEKLY_STREAK_KEY,
} from "./keys";

export function getWeekIndex() {
  const raw = localStorage.getItem(WEEK_INDEX_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 1;
}

export function setWeekIndex(weekIndex: number) {
  localStorage.setItem(WEEK_INDEX_KEY, String(weekIndex));
}

export function getWeekCompletions(): WeekCompletion[] {
  const raw = localStorage.getItem(WEEK_COMPLETIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WeekCompletion[]) : [];
  } catch {
    return [];
  }
}

export function saveWeekCompletions(items: WeekCompletion[]) {
  localStorage.setItem(WEEK_COMPLETIONS_KEY, JSON.stringify(items));
}

export function clearWeekCompletions() {
  localStorage.removeItem(WEEK_COMPLETIONS_KEY);
}

export function getWeeklyStreak() {
  const raw = localStorage.getItem(WEEKLY_STREAK_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function setWeeklyStreak(streak: number) {
  localStorage.setItem(WEEKLY_STREAK_KEY, String(streak));
}

export function setWeekDoneFlag(value: boolean) {
  if (value) {
    localStorage.setItem(WEEK_DONE_KEY, "1");
    return;
  }
  localStorage.removeItem(WEEK_DONE_KEY);
}

export function getAndClearWeekDoneFlag() {
  const isDone = localStorage.getItem(WEEK_DONE_KEY) === "1";
  if (isDone) localStorage.removeItem(WEEK_DONE_KEY);
  return isDone;
}
