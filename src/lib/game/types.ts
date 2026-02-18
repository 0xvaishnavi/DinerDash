export const DISHES = [
  "dosa",
  "chole_bhature",
  "parathe",
  "pani_puri",
  "vada_pav",
] as const;

export type DishName = (typeof DISHES)[number];

export type SpeedTier = "green" | "yellow" | "red" | "miss";

export type CustomerState =
  | "walking"
  | "seated"
  | "waiting_order"
  | "served_partial"
  | "served_complete"
  | "leaving"
  | "exited";

export type CustomerType = "young" | "traditional";

export interface LevelConfig {
  id: number;
  label: string;
  seats: number;
  plateCapacity: number;
  spawnIntervalMs: number;
  minScore: number;
  bestScoreTarget: number;
}

export interface PlateSlot {
  index: number;
  dish: DishName | null;
}

export interface OrderState {
  orderId: string;
  customerId: string;
  dishesRequested: DishName[];
  dishesServed: DishName[];
  placedAt: number;
  deadlineAt: number;
}
