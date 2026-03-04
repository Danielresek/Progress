export type Exercise = {
  id: string;
  name: string;
  muscleGroup: "Bryst" | "Skuldre" | "Triceps" | "Rygg" | "Biceps" | "Bein" | "Mage";
};

export const EXERCISES: Exercise[] = [
  { id: "bench", name: "Benkpress", muscleGroup: "Bryst" },
  { id: "incline-db", name: "Incline hantelpress", muscleGroup: "Bryst" },
  { id: "ohp", name: "Skulderpress", muscleGroup: "Skuldre" },
  { id: "lat-pd", name: "Lat pulldown", muscleGroup: "Rygg" },
  { id: "row", name: "Sittende roing", muscleGroup: "Rygg" },
  { id: "curl", name: "Biceps curl", muscleGroup: "Biceps" },
  { id: "tri-pd", name: "Triceps pushdown", muscleGroup: "Triceps" },
  { id: "squat", name: "Knebøy", muscleGroup: "Bein" },
  { id: "rdl", name: "Rumensk markløft", muscleGroup: "Bein" },
  { id: "leg-press", name: "Leg press", muscleGroup: "Bein" },
  { id: "crunch", name: "Cable crunch", muscleGroup: "Mage" },
];