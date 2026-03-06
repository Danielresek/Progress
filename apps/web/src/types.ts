export type Plan = {
  name: string;
  days: string[];
};

export type DayExercise = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  startWeight: number;
};

export type LogEntry = {
  dayId: number;
  exerciseId: string;
  performedWeight: number;
  performedReps: number;
  timestamp: number;
  weekIndex?: number;
};

export type WeekCompletion = {
  weekIndex: number;
  dayId: number;
  completedAt: number;
};
