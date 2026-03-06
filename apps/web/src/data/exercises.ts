export type Exercise = {
  id: string;
  name: string;
  muscleGroup:
    | "Chest"
    | "Back"
    | "Shoulders"
    | "Biceps"
    | "Triceps"
    | "Legs"
    | "Glutes"
    | "Abs";
};

export const EXERCISES: Exercise[] = [
  // Chest
  { id: "bench-press", name: "Bench Press", muscleGroup: "Chest" },
  { id: "incline-bench", name: "Incline Bench Press", muscleGroup: "Chest" },
  { id: "incline-db-press", name: "Incline Dumbbell Press", muscleGroup: "Chest" },
  { id: "chest-press", name: "Machine Chest Press", muscleGroup: "Chest" },
  { id: "cable-fly", name: "Cable Fly", muscleGroup: "Chest" },

  // Back
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "Back" },
  { id: "pull-up", name: "Pull Up", muscleGroup: "Back" },
  { id: "barbell-row", name: "Barbell Row", muscleGroup: "Back" },
  { id: "seated-row", name: "Seated Cable Row", muscleGroup: "Back" },
  { id: "low-row", name: "Low Row (Cable)", muscleGroup: "Back" },

  // Shoulders
  { id: "overhead-press", name: "Overhead Press", muscleGroup: "Shoulders" },
  { id: "db-shoulder-press", name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders" },
  { id: "lateral-raise", name: "Lateral Raise", muscleGroup: "Shoulders" },
  { id: "rear-delt-fly", name: "Rear Delt Fly", muscleGroup: "Shoulders" },
  { id: "face-pull", name: "Face Pull", muscleGroup: "Shoulders" },

  // Biceps
  { id: "barbell-curl", name: "Barbell Curl", muscleGroup: "Biceps" },
  { id: "db-curl", name: "Dumbbell Curl", muscleGroup: "Biceps" },
  { id: "hammer-curl", name: "Hammer Curl", muscleGroup: "Biceps" },
  { id: "cable-curl", name: "Cable Curl", muscleGroup: "Biceps" },

  // Triceps
  { id: "triceps-pushdown", name: "Triceps Pushdown", muscleGroup: "Triceps" },
  { id: "overhead-triceps", name: "Overhead Triceps Extension", muscleGroup: "Triceps" },
  { id: "skullcrusher", name: "Skullcrusher", muscleGroup: "Triceps" },
  { id: "dips", name: "Dips", muscleGroup: "Triceps" },

  // Legs
  { id: "squat", name: "Squat", muscleGroup: "Legs" },
  { id: "leg-press", name: "Leg Press", muscleGroup: "Legs" },
  { id: "rdl", name: "Romanian Deadlift", muscleGroup: "Legs" },
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "Legs" },
  { id: "leg-curl", name: "Leg Curl", muscleGroup: "Legs" },
  { id: "calf-raise", name: "Standing Calf Raise", muscleGroup: "Legs" },
  { id: "leg-press-calf", name: "Leg Press Calf Raise", muscleGroup: "Legs" },

  // Glutes
  { id: "hip-thrust", name: "Barbell Hip Thrust", muscleGroup: "Glutes" },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", muscleGroup: "Glutes" },
  { id: "lunge", name: "Dumbbell Lunge", muscleGroup: "Glutes" },

  // Abs
  { id: "cable-crunch", name: "Cable Crunch", muscleGroup: "Abs" },
  { id: "leg-raise", name: "Hanging Leg Raise", muscleGroup: "Abs" },
  { id: "plank", name: "Plank", muscleGroup: "Abs" },
];