import { z } from "zod";

const eventEnvelopeSchema = z.object({
  event_id: z.string().uuid(),
  session_id: z.string().uuid(),
  level: z.number().int().min(1).max(4),
  timestamp: z.number().int().positive(),
});

const speedTierSchema = z.enum(["green", "yellow", "red", "miss"]);

export const gameEventSchema = z.discriminatedUnion("event_name", [
  eventEnvelopeSchema.extend({
    event_name: z.literal("session_start"),
    payload: z.object({
      player_id: z.string().min(1),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("customer_arrived"),
    payload: z.object({
      customer_id: z.string().min(1),
      customer_type: z.enum(["young", "traditional"]),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("customer_seated"),
    payload: z.object({
      customer_id: z.string().min(1),
      table_id: z.string().min(1),
      wait_time_ms: z.number().int().nonnegative(),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("order_placed"),
    payload: z.object({
      order_id: z.string().min(1),
      customer_id: z.string().min(1),
      dish_1: z.string().min(1),
      dish_2: z.string().min(1).optional(),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("dish_selected"),
    payload: z.object({
      order_id: z.string().min(1),
      dish_name: z.string().min(1),
      plate_slot: z.number().int().min(0),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("dish_discarded"),
    payload: z.object({
      dish_name: z.string().min(1),
      plate_slot: z.number().int().min(0),
      reason: z.string().min(1),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("order_served"),
    payload: z.object({
      order_id: z.string().min(1),
      dish_name: z.string().min(1),
      serve_time_ms: z.number().int().nonnegative(),
      speed_tier: speedTierSchema,
      coins: z.number().int().nonnegative(),
      reputation: z.number().int(),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("order_completed"),
    payload: z.object({
      order_id: z.string().min(1),
      total_serve_time_ms: z.number().int().nonnegative(),
      total_coins: z.number().int().nonnegative(),
      stars: z.number().int().min(0).max(3),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("order_expired"),
    payload: z.object({
      order_id: z.string().min(1),
      dishes_pending: z.array(z.string().min(1)).min(1),
      reputation_lost: z.number().int().nonnegative(),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("customer_left"),
    payload: z.object({
      customer_id: z.string().min(1),
      left_reason: z.string().min(1),
      satisfaction_score: z.number().int().min(0).max(100),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("level_completed"),
    payload: z.object({
      total_coins: z.number().int().nonnegative(),
      total_reputation: z.number().int().min(0).max(100),
      orders_served: z.number().int().nonnegative(),
      orders_expired: z.number().int().nonnegative(),
      stars_earned: z.number().int().min(0).max(3),
    }),
  }),
  eventEnvelopeSchema.extend({
    event_name: z.literal("session_end"),
    payload: z.object({
      total_playtime_ms: z.number().int().nonnegative(),
      levels_completed: z.number().int().nonnegative(),
      final_score: z.number().int().nonnegative(),
    }),
  }),
]);

export type GameEvent = z.infer<typeof gameEventSchema>;
export type GameEventName = GameEvent["event_name"];
export type GameEventPayload<TName extends GameEventName> = Extract<
  GameEvent,
  { event_name: TName }
>["payload"];
