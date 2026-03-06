import type { LogEntry } from "../types";
import { LOG_KEY } from "./keys";

export function getLogs(): LogEntry[] {
  const raw = localStorage.getItem(LOG_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LogEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveLogs(logs: LogEntry[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function addLogEntry(entry: LogEntry) {
  const logs = getLogs();
  logs.push(entry);
  saveLogs(logs);
}

export function clearLogs() {
  localStorage.removeItem(LOG_KEY);
}
