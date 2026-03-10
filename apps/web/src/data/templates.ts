export type PlanTemplate = {
  id: string;
  name: string;
  description: string;
  days: {
    name: string;
    exercises: {
      exerciseId: string;
      sets: number;
      reps: number;
      startWeight?: number;
    }[];
  }[];
};

export const PLAN_TEMPLATES: PlanTemplate[] = [
    {
    id: "push-pull-legs-3-days",
    name: "Push / Pull / Legs",
    description: "Classic Push Pull Legs split focused on balanced hypertrophy and compound lifts.",
    days: [
      {
        name: "Push",
        exercises: [
          { exerciseId: "bench-press", sets: 4, reps: 6 },
          { exerciseId: "incline-db-press", sets: 3, reps: 8 },
          { exerciseId: "db-shoulder-press", sets: 3, reps: 8 },
          { exerciseId: "lateral-raise", sets: 3, reps: 12 },
          { exerciseId: "triceps-pushdown", sets: 3, reps: 12 },
          { exerciseId: "overhead-triceps", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Pull",
        exercises: [
          { exerciseId: "pull-up", sets: 3, reps: 8 },
          { exerciseId: "lat-pulldown", sets: 3, reps: 10 },
          { exerciseId: "seated-row", sets: 3, reps: 10 },
          { exerciseId: "face-pull", sets: 3, reps: 12 },
          { exerciseId: "barbell-curl", sets: 3, reps: 12 },
          { exerciseId: "hammer-curl", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Legs",
        exercises: [
          { exerciseId: "squat", sets: 4, reps: 6 },
          { exerciseId: "leg-press", sets: 3, reps: 10 },
          { exerciseId: "rdl", sets: 3, reps: 8 },
          { exerciseId: "leg-extension", sets: 3, reps: 12 },
          { exerciseId: "seated-leg-curl", sets: 3, reps: 12 },
          { exerciseId: "standing-calf-raise", sets: 4, reps: 12 },
        ],
      },
    ],
  },
  {
    id: "full-body-3-days",
    name: "Full Body 3 Days",
    description: "Three full-body workouts focused on compound movements and simple progression.",
    days: [
      {
        name: "Workout 1",
        exercises: [
          { exerciseId: "squat", sets: 3, reps: 8 },
          { exerciseId: "bench-press", sets: 3, reps: 8 },
          { exerciseId: "lat-pulldown", sets: 3, reps: 10 },
          { exerciseId: "lateral-raise", sets: 3, reps: 12 },
          { exerciseId: "triceps-pushdown", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Workout 2",
        exercises: [
          { exerciseId: "rdl", sets: 3, reps: 8 },
          { exerciseId: "incline-db-press", sets: 3, reps: 10 },
          { exerciseId: "low-row", sets: 3, reps: 10 },
          { exerciseId: "face-pull", sets: 3, reps: 12 },
          { exerciseId: "barbell-curl", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Workout 3",
        exercises: [
          { exerciseId: "leg-press", sets: 3, reps: 10 },
          { exerciseId: "pull-up", sets: 3, reps: 8 },
          { exerciseId: "db-shoulder-press", sets: 3, reps: 10 },
          { exerciseId: "bench-press", sets: 3, reps: 8 },
          { exerciseId: "cable-crunch", sets: 3, reps: 15 },
        ],
      },
    ],
  },
  {
    id: "upper-lower-4-days",
    name: "Upper / Lower 4 Days",
    description: "Four sessions split between upper and lower body for balanced training.",
    days: [
      {
        name: "Upper 1",
        exercises: [
          { exerciseId: "bench-press", sets: 4, reps: 6 },
          { exerciseId: "lat-pulldown", sets: 3, reps: 8 },
          { exerciseId: "incline-db-press", sets: 3, reps: 10 },
          { exerciseId: "low-row", sets: 3, reps: 10 },
          { exerciseId: "triceps-pushdown", sets: 3, reps: 12 },
          { exerciseId: "barbell-curl", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Lower 1",
        exercises: [
          { exerciseId: "squat", sets: 4, reps: 6 },
          { exerciseId: "leg-press", sets: 3, reps: 10 },
          { exerciseId: "rdl", sets: 3, reps: 8 },
          { exerciseId: "cable-crunch", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Upper 2",
        exercises: [
          { exerciseId: "pull-up", sets: 3, reps: 8 },
          { exerciseId: "db-shoulder-press", sets: 3, reps: 10 },
          { exerciseId: "bench-press", sets: 3, reps: 8 },
          { exerciseId: "face-pull", sets: 3, reps: 12 },
          { exerciseId: "lateral-raise", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Lower 2",
        exercises: [
          { exerciseId: "leg-press", sets: 4, reps: 8 },
          { exerciseId: "rdl", sets: 3, reps: 8 },
          { exerciseId: "squat", sets: 3, reps: 8 },
          { exerciseId: "cable-crunch", sets: 3, reps: 15 },
        ],
      },
    ],
  },
];
