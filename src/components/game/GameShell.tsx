"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

import { GameHud } from "@/components/game/GameHud";
import { PlateSlots } from "@/components/game/PlateSlots";
import { playSfx } from "@/lib/audio/sfx";
import { emitGameEvent } from "@/lib/events/emitter";
import {
  COIN_ICON,
  CUSTOMER_STANDING_SPRITES,
  CUSTOMER_SPRITES,
  DISH_ASSETS,
  DUSTBIN_ICON,
  EMPTY_PLATE_ICON,
  FLOOR_BACKGROUND,
  GREEN_CHECK,
  ENTRANCE_DOOR,
  SPEECH_BUBBLE,
  TABLE_SPRITE,
  WAITER_SPRITE,
} from "@/lib/game/assets";
import { LEVEL_CONFIGS, ORDER_DURATION_SECONDS, getLevelConfig } from "@/lib/game/config";
import { getScoreOutcomeByServeTime, getStarRating } from "@/lib/game/scoring";
import { useGameStore } from "@/lib/game/store";
import { DISHES, type DishName } from "@/lib/game/types";
import { nowMs } from "@/lib/utils/time";

interface ActiveCustomer {
  customerId: string;
  tableId: string;
  orderId: string;
  customerType: "young" | "traditional";
  spritePath: string;
  standingSpritePath: string;
  phase: "walking" | "waiting" | "leaving";
  walkArriveAt: number;
  dishesRequested: DishName[];
  dishesServed: DishName[];
  arrivedAt: number;
  placedAt: number;
  deadlineAt: number;
  leavingReason?: "served" | "expired" | "round_ended";
}

interface CoinBurst {
  id: string;
  x: number;
  y: number;
  coins: number;
  dish: DishName;
}

interface RoundSummary {
  level: number;
  revenue: number;
  reputation: number;
  stars: number;
  ordersServed: number;
  ordersExpired: number;
}

interface GameShellProps {
  onRoundComplete?: (summary: RoundSummary) => void;
}

interface LevelOneTutorialFlags {
  firstOrderPlaced: boolean;
  firstFastServe: boolean;
  firstSlowServe: boolean;
  firstOrderExpired: boolean;
  firstWrongDish: boolean;
}

const DEFAULT_LEVEL_ONE_TUTORIAL_FLAGS: LevelOneTutorialFlags = {
  firstOrderPlaced: false,
  firstFastServe: false,
  firstSlowServe: false,
  firstOrderExpired: false,
  firstWrongDish: false,
};

const WAITER_SIZE = 121;
const WAITER_HALF = WAITER_SIZE / 2;
const CUSTOMER_SIZE_PX = 106;
const TABLE_HEIGHT_PX = 187;
const TABLE_HALF_HEIGHT_PX = TABLE_HEIGHT_PX / 2;
const WAITER_SPEED_PX_PER_SEC = 240;
const SERVE_DISTANCE_PX = 145;
const COUNTER_PICK_DISTANCE_PX = 120;
const COUNTER_RESPAWN_MS = 3000;
const CUSTOMER_LEAVE_DELAY_MS = 500;
const EXPIRED_CUSTOMER_FADE_MS = 1000;
const CUSTOMER_WALK_DURATION_MS = 1200;
const ENTRANCE_X_PERCENT = 90;
const ENTRANCE_Y_PERCENT = 8;
const TABLE_SPRITE_TOP_PERCENT = 58;
const CUSTOMER_BASE_OFFSET_PERCENT = 2;
const CUSTOMER_Y_OFFSET_MULTIPLIER = 11;
const CUSTOMER_TOP_PERCENT =
  TABLE_SPRITE_TOP_PERCENT - CUSTOMER_BASE_OFFSET_PERCENT * CUSTOMER_Y_OFFSET_MULTIPLIER;
const ORDER_BUBBLE_TOP_PERCENT = -11.5;
const LAST_SESSION_STORAGE_KEY = "diner_dash_last_session_id";
const TABLE_TOP_SAFE_PADDING_PX = 12;

function getPendingDishes(customer: ActiveCustomer): DishName[] {
  const served = [...customer.dishesServed];

  return customer.dishesRequested.filter((dish) => {
    const servedIndex = served.indexOf(dish);
    if (servedIndex === -1) {
      return true;
    }

    served.splice(servedIndex, 1);
    return false;
  });
}

function isDishPending(customer: ActiveCustomer, dish: DishName): boolean {
  return getPendingDishes(customer).includes(dish);
}

function isDishServedAtIndex(customer: ActiveCustomer, index: number): boolean {
  const dish = customer.dishesRequested[index];
  const servedCount = customer.dishesServed.filter((item) => item === dish).length;
  const requestedCountUntilIndex = customer.dishesRequested
    .slice(0, index + 1)
    .filter((item) => item === dish).length;

  return servedCount >= requestedCountUntilIndex;
}

function pickCustomerType(level: number): "young" | "traditional" {
  if (level <= 1) {
    return Math.random() < 0.65 ? "young" : "traditional";
  }

  if (level === 2) {
    return Math.random() < 0.55 ? "young" : "traditional";
  }

  return Math.random() < 0.45 ? "young" : "traditional";
}

function pickCustomerSprite(
  type: "young" | "traditional",
  activeCustomers: ActiveCustomer[],
): { seated: string; standing: string } {
  const typeOptions = CUSTOMER_SPRITES[type];
  const fallbackOptions =
    type === "young" ? CUSTOMER_SPRITES.traditional : CUSTOMER_SPRITES.young;
  const options = [...typeOptions, ...fallbackOptions];
  const used = new Set(activeCustomers.map((customer) => customer.spritePath));
  const available = options.filter((path) => !used.has(path));
  const pool = available.length > 0 ? available : options;

  const seated = pool[Math.floor(Math.random() * pool.length)];
  const standingOptions = CUSTOMER_STANDING_SPRITES[type];
  const seatedIndex = typeOptions.indexOf(seated);
  const standing =
    standingOptions[seatedIndex] ??
    standingOptions[0] ??
    CUSTOMER_STANDING_SPRITES.young[0];
  return { seated, standing };
}

function pickOrderDishes(level: number, activeCustomers: ActiveCustomer[]): DishName[] {
  const demand = DISHES.reduce(
    (acc, dish) => {
      acc[dish] = 0;
      return acc;
    },
    {} as Record<DishName, number>,
  );

  for (const customer of activeCustomers) {
    for (const pendingDish of getPendingDishes(customer)) {
      demand[pendingDish] += 1;
    }
  }

  const firstMin = Math.min(...DISHES.map((dish) => demand[dish]));
  const firstChoices = DISHES.filter((dish) => demand[dish] === firstMin);
  const first = firstChoices[Math.floor(Math.random() * firstChoices.length)];
  const doubleOrderChance =
    level <= 1 ? 0 : level === 2 ? 0.45 : level === 3 ? 0.55 : 0.7;
  const allowDouble = Math.random() < doubleOrderChance;
  if (!allowDouble) {
    return [first];
  }

  const secondPool = DISHES.filter((dish) => dish !== first);
  const secondMin = Math.min(...secondPool.map((dish) => demand[dish]));
  const secondChoices = secondPool.filter((dish) => demand[dish] === secondMin);
  const second = secondChoices[Math.floor(Math.random() * secondChoices.length)];
  return [first, second];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface TablePosition {
  tableId: string;
  xPercent: number;
  yPercent: number;
}

function getTablePositions(seats: number): TablePosition[] {
  const columns = seats <= 4 ? 2 : seats <= 6 ? 3 : 4;
  const rows = Math.ceil(seats / columns);
  const xForTwoCols = [28, 72];
  const threeColumnSpreadMultiplier = 1.1;
  const rowSpacingMultiplier = 1.73;

  return Array.from({ length: seats }, (_, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const xPercent = (() => {
      if (columns === 2) {
        return xForTwoCols[col];
      }
      const normalizedX = (col + 1) / (columns + 1);
      if (columns === 3) {
        const spreadX =
          0.5 + (normalizedX - 0.5) * threeColumnSpreadMultiplier;
        return clamp(spreadX, 0.08, 0.92) * 100;
      }
      return normalizedX * 100;
    })();
    const normalizedRow = (row + 1) / (rows + 1);
    const spreadRow = 0.5 + (normalizedRow - 0.5) * rowSpacingMultiplier;
    const yPercent = clamp(spreadRow, 0.08, 0.92) * 100;

    return {
      tableId: `table-${index + 1}`,
      xPercent,
      yPercent,
    };
  });
}

function createCounterCooldowns(): Record<DishName, number> {
  return DISHES.reduce(
    (acc, dish) => {
      acc[dish] = 0;
      return acc;
    },
    {} as Record<DishName, number>,
  );
}

export function GameShell({ onRoundComplete }: GameShellProps) {
  const {
    sessionId,
    level,
    roundSecondsLeft,
    revenue,
    reputation,
    plateSlots,
    selectedPlateSlot,
    setLevel,
    resetRound,
    resetSession,
    addDishToFirstEmptySlot,
    setSelectedPlateSlot,
    clearSelectedPlate,
    clearPlateSlot,
    applyServeOutcome,
    tickRound,
  } = useGameStore();

  const [roundActive, setRoundActive] = useState(false);
  const [activeCustomers, setActiveCustomers] = useState<ActiveCustomer[]>([]);
  const [ordersServed, setOrdersServed] = useState(0);
  const [ordersExpired, setOrdersExpired] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [roundStartAt, setRoundStartAt] = useState<number | null>(null);
  const [clockMs, setClockMs] = useState<number>(() => nowMs());
  const [waiterPos, setWaiterPos] = useState({ x: 90, y: 330 });
  const [nearCounterDish, setNearCounterDish] = useState<DishName | null>(null);
  const [counterCooldowns, setCounterCooldowns] = useState<Record<DishName, number>>(
    () => createCounterCooldowns(),
  );
  const [coinBursts, setCoinBursts] = useState<CoinBurst[]>([]);
  const [arenaMetrics, setArenaMetrics] = useState({
    floorHeight: 0,
    counterHeight: 0,
    entranceBottom: 0,
  });
  const [roundResult, setRoundResult] = useState<RoundSummary | null>(null);

  const customersRef = useRef<ActiveCustomer[]>([]);
  const levelRef = useRef(level);
  const roundActiveRef = useRef(roundActive);
  const sessionRef = useRef(sessionId);
  const ordersServedRef = useRef(ordersServed);
  const ordersExpiredRef = useRef(ordersExpired);
  const floorRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLDivElement | null>(null);
  const entranceRef = useRef<HTMLDivElement | null>(null);
  const tableRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const counterDishRefs = useRef<Record<DishName, HTMLButtonElement | null>>(
    {} as Record<DishName, HTMLButtonElement | null>,
  );
  const pressedKeysRef = useRef<Record<string, boolean>>({});
  const dragPointerIdRef = useRef<number | null>(null);
  const coinBurstTimersRef = useRef<number[]>([]);
  const customerLeaveTimersRef = useRef<number[]>([]);
  const countdownStartedRef = useRef(false);
  const levelOneTutorialRef = useRef<LevelOneTutorialFlags>({
    ...DEFAULT_LEVEL_ONE_TUTORIAL_FLAGS,
  });

  useEffect(() => {
    customersRef.current = activeCustomers;
  }, [activeCustomers]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_SESSION_STORAGE_KEY, sessionId);
      window.dispatchEvent(
        new CustomEvent("dinerDashSessionUpdated", {
          detail: { sessionId },
        }),
      );
    } catch {
      // Ignore storage failures and keep gameplay unaffected.
    }
  }, [sessionId]);

  useEffect(() => {
    ordersServedRef.current = ordersServed;
  }, [ordersServed]);

  useEffect(() => {
    ordersExpiredRef.current = ordersExpired;
  }, [ordersExpired]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = nowMs();
      setClockMs(now);
      if (!roundActiveRef.current) {
        return;
      }

      const transitioned: ActiveCustomer[] = [];
      setActiveCustomers((prev) => {
        let changed = false;
        const next = prev.map((customer) => {
          if (customer.phase !== "walking" || now < customer.walkArriveAt) {
            return customer;
          }

          changed = true;
          const seatedCustomer: ActiveCustomer = {
            ...customer,
            phase: "waiting",
            placedAt: now,
            deadlineAt: now + ORDER_DURATION_SECONDS * 1000,
          };
          transitioned.push(seatedCustomer);
          return seatedCustomer;
        });

        return changed ? next : prev;
      });

      if (transitioned.length === 0) {
        return;
      }

      const activeSession = sessionRef.current;
      const activeLevel = levelRef.current;

      for (const customer of transitioned) {
        void emitGameEvent({
          eventName: "customer_seated",
          sessionId: activeSession,
          level: activeLevel,
          payload: {
            customer_id: customer.customerId,
            table_id: customer.tableId,
            wait_time_ms: Math.max(0, now - customer.arrivedAt),
          },
        });

        void emitGameEvent({
          eventName: "order_placed",
          sessionId: activeSession,
          level: activeLevel,
          payload: {
            order_id: customer.orderId,
            customer_id: customer.customerId,
            dish_1: customer.dishesRequested[0],
            dish_2: customer.dishesRequested[1],
          },
        });
      }

      if (levelRef.current === 1 && !levelOneTutorialRef.current.firstOrderPlaced) {
        levelOneTutorialRef.current.firstOrderPlaced = true;
        setFeedback("First order placed. Match the dish bubble and serve fast!");
      }
    }, 120);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    return () => {
      for (const timerId of coinBurstTimersRef.current) {
        window.clearTimeout(timerId);
      }
      coinBurstTimersRef.current = [];
      for (const timerId of customerLeaveTimersRef.current) {
        window.clearTimeout(timerId);
      }
      customerLeaveTimersRef.current = [];
    };
  }, []);

  const clearCustomerLeaveTimers = useCallback(() => {
    for (const timerId of customerLeaveTimersRef.current) {
      window.clearTimeout(timerId);
    }
    customerLeaveTimersRef.current = [];
  }, []);

  const markLevelOneTutorialMessage = useCallback(
    (key: keyof LevelOneTutorialFlags, message: string): boolean => {
      if (levelRef.current !== 1 || levelOneTutorialRef.current[key]) {
        return false;
      }
      levelOneTutorialRef.current[key] = true;
      setFeedback(message);
      return true;
    },
    [],
  );

  const spawnCoinBurst = useCallback((tableId: string, dish: DishName, coins: number) => {
    if (coins <= 0) {
      return;
    }
    playSfx("coin", { volume: 0.9 });

    const floor = floorRef.current;
    const tableEl = tableRefs.current[tableId];
    if (!floor || !tableEl) {
      return;
    }

    const floorRect = floor.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();
    const id = `${tableId}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
    const burst: CoinBurst = {
      id,
      x: tableRect.left - floorRect.left + tableRect.width / 2,
      y: tableRect.top - floorRect.top + tableRect.height * 0.14,
      coins,
      dish,
    };

    setCoinBursts((prev) => [...prev, burst]);
    const timerId = window.setTimeout(() => {
      setCoinBursts((prev) => prev.filter((item) => item.id !== id));
      coinBurstTimersRef.current = coinBurstTimersRef.current.filter((item) => item !== timerId);
    }, 850);
    coinBurstTimersRef.current.push(timerId);
  }, []);

  const currentLevelConfig = useMemo(() => getLevelConfig(level), [level]);
  const maxLevel = useMemo(
    () => LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1]?.id ?? 4,
    [],
  );

  const measureArenaMetrics = useCallback(() => {
    const floorHeight = floorRef.current?.clientHeight ?? 0;
    const counterHeight = counterRef.current?.clientHeight ?? 0;
    const entranceBottom = entranceRef.current
      ? entranceRef.current.offsetTop + entranceRef.current.clientHeight
      : 0;
    setArenaMetrics((prev) =>
      prev.floorHeight === floorHeight &&
      prev.counterHeight === counterHeight &&
      prev.entranceBottom === entranceBottom
        ? prev
        : { floorHeight, counterHeight, entranceBottom },
    );
  }, []);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(measureArenaMetrics);

    window.addEventListener("resize", measureArenaMetrics);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measureArenaMetrics);
    };
  }, [measureArenaMetrics]);

  const clampWaiterPosition = useCallback((x: number, y: number) => {
    const floor = floorRef.current;
    if (!floor) {
      return { x, y };
    }

    const width = floor.clientWidth;
    const height = floor.clientHeight;

    return {
      x: clamp(x, WAITER_HALF, Math.max(WAITER_HALF, width - WAITER_HALF)),
      y: clamp(y, WAITER_HALF, Math.max(WAITER_HALF, height - WAITER_HALF)),
    };
  }, []);

  const getNearestCounterDishAtPosition = useCallback((x: number, y: number): DishName | null => {
    const floor = floorRef.current;
    if (!floor) {
      return null;
    }

    const floorRect = floor.getBoundingClientRect();
    let nearestDish: DishName | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const dish of DISHES) {
      const dishEl = counterDishRefs.current[dish];
      if (!dishEl) {
        continue;
      }

      const dishRect = dishEl.getBoundingClientRect();
      const dishCenterX = dishRect.left - floorRect.left + dishRect.width / 2;
      const dishCenterY = dishRect.top - floorRect.top + dishRect.height / 2;
      const distance = Math.hypot(x - dishCenterX, y - dishCenterY);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestDish = dish;
      }
    }

    if (nearestDish && nearestDistance <= COUNTER_PICK_DISTANCE_PX) {
      return nearestDish;
    }

    return null;
  }, []);

  const resetWaiterPosition = useCallback(() => {
    const floor = floorRef.current;
    if (!floor) {
      const fallback = { x: 240, y: 360 };
      setWaiterPos(fallback);
      setNearCounterDish(null);
      return;
    }

    const width = floor.clientWidth;
    const height = floor.clientHeight;
    const next = clampWaiterPosition(width / 2, height / 2);
    setWaiterPos(next);
    setNearCounterDish(getNearestCounterDishAtPosition(next.x, next.y));
  }, [clampWaiterPosition, getNearestCounterDishAtPosition]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      resetWaiterPosition();
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [resetWaiterPosition]);

  const moveWaiterToClientPoint = useCallback(
    (clientX: number, clientY: number) => {
      const floor = floorRef.current;
      if (!floor) {
        return;
      }

      const rect = floor.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const next = clampWaiterPosition(localX, localY);
      setWaiterPos(next);
      setNearCounterDish(getNearestCounterDishAtPosition(next.x, next.y));
    },
    [clampWaiterPosition, getNearestCounterDishAtPosition],
  );

  const isWaiterNearTable = useCallback(
    (tableId: string): boolean => {
      const floor = floorRef.current;
      const tableEl = tableRefs.current[tableId];
      if (!floor || !tableEl) {
        return true;
      }

      const floorRect = floor.getBoundingClientRect();
      const tableRect = tableEl.getBoundingClientRect();
      const tableCenterX = tableRect.left - floorRect.left + tableRect.width / 2;
      const tableCenterY = tableRect.top - floorRect.top + tableRect.height / 2;
      const distance = Math.hypot(waiterPos.x - tableCenterX, waiterPos.y - tableCenterY);

      return distance <= SERVE_DISTANCE_PX;
    },
    [waiterPos.x, waiterPos.y],
  );

  const getDistanceToTable = useCallback(
    (tableId: string): number => {
      const floor = floorRef.current;
      const tableEl = tableRefs.current[tableId];
      if (!floor || !tableEl) {
        return Number.POSITIVE_INFINITY;
      }

      const floorRect = floor.getBoundingClientRect();
      const tableRect = tableEl.getBoundingClientRect();
      const tableCenterX = tableRect.left - floorRect.left + tableRect.width / 2;
      const tableCenterY = tableRect.top - floorRect.top + tableRect.height / 2;

      return Math.hypot(waiterPos.x - tableCenterX, waiterPos.y - tableCenterY);
    },
    [waiterPos.x, waiterPos.y],
  );

  const getDistanceToCounterDish = useCallback(
    (dish: DishName): number => {
      const floor = floorRef.current;
      const dishEl = counterDishRefs.current[dish];
      if (!floor || !dishEl) {
        return Number.POSITIVE_INFINITY;
      }

      const floorRect = floor.getBoundingClientRect();
      const dishRect = dishEl.getBoundingClientRect();
      const dishCenterX = dishRect.left - floorRect.left + dishRect.width / 2;
      const dishCenterY = dishRect.top - floorRect.top + dishRect.height / 2;

      return Math.hypot(waiterPos.x - dishCenterX, waiterPos.y - dishCenterY);
    },
    [waiterPos.x, waiterPos.y],
  );

  useEffect(() => {
    const onResize = () => {
      setWaiterPos((prev) => {
        const next = clampWaiterPosition(prev.x, prev.y);
        setNearCounterDish(getNearestCounterDishAtPosition(next.x, next.y));
        return next;
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [clampWaiterPosition, getNearestCounterDishAtPosition]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.key.startsWith("Arrow")) {
        return;
      }
      pressedKeysRef.current[event.key] = true;
      event.preventDefault();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!event.key.startsWith("Arrow")) {
        return;
      }
      pressedKeysRef.current[event.key] = false;
      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const animate = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const keys = pressedKeysRef.current;
      let dx = 0;
      let dy = 0;

      if (keys.ArrowLeft) dx -= 1;
      if (keys.ArrowRight) dx += 1;
      if (keys.ArrowUp) dy -= 1;
      if (keys.ArrowDown) dy += 1;

      if (dx !== 0 || dy !== 0) {
        const magnitude = Math.hypot(dx, dy) || 1;
        const moveX = (dx / magnitude) * WAITER_SPEED_PX_PER_SEC * dt;
        const moveY = (dy / magnitude) * WAITER_SPEED_PX_PER_SEC * dt;

        setWaiterPos((prev) => {
          const next = clampWaiterPosition(prev.x + moveX, prev.y + moveY);
          setNearCounterDish(getNearestCounterDishAtPosition(next.x, next.y));
          return next;
        });
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [clampWaiterPosition, getNearestCounterDishAtPosition]);

  const spawnCustomer = useCallback(async () => {
    const current = customersRef.current;
    const seats = currentLevelConfig.seats;
    const occupied = new Set(current.map((customer) => customer.tableId));
    const freeTableIndices = Array.from({ length: seats }, (_, index) => index).filter(
      (index) => !occupied.has(`table-${index + 1}`),
    );

    if (freeTableIndices.length === 0) {
      return;
    }

    const freeTableIndex =
      freeTableIndices[Math.floor(Math.random() * freeTableIndices.length)];

    const now = nowMs();
    const customerId = `cust-${uuidv4().slice(0, 8)}`;
    const tableId = `table-${freeTableIndex + 1}`;
    const orderId = `order-${uuidv4().slice(0, 8)}`;
    const customerType = pickCustomerType(levelRef.current);
    const spriteSet = pickCustomerSprite(customerType, current);
    const dishesRequested: DishName[] = pickOrderDishes(levelRef.current, current);

    const customer: ActiveCustomer = {
      customerId,
      tableId,
      orderId,
      customerType,
      spritePath: spriteSet.seated,
      standingSpritePath: spriteSet.standing,
      phase: "walking",
      walkArriveAt: now + CUSTOMER_WALK_DURATION_MS,
      dishesRequested,
      dishesServed: [],
      arrivedAt: now,
      placedAt: 0,
      deadlineAt: Number.MAX_SAFE_INTEGER,
    };

    setActiveCustomers((prev) => [...prev, customer]);
    playSfx("npcEntry", { volume: 0.9 });

    const activeSession = sessionRef.current;
    const activeLevel = levelRef.current;

    await emitGameEvent({
      eventName: "customer_arrived",
      sessionId: activeSession,
      level: activeLevel,
      payload: {
        customer_id: customerId,
        customer_type: customerType,
      },
    });
  }, [currentLevelConfig.seats]);

  useEffect(() => {
    if (!roundActive) {
      return;
    }

    const spawnTimer = window.setInterval(() => {
      void spawnCustomer();
    }, currentLevelConfig.spawnIntervalMs);

    return () => {
      window.clearInterval(spawnTimer);
    };
  }, [currentLevelConfig.spawnIntervalMs, roundActive, spawnCustomer]);

  useEffect(() => {
    if (!roundActive) {
      return;
    }

    const tickTimer = window.setInterval(() => {
      const state = useGameStore.getState();
      const now = nowMs();
      setClockMs(now);

      if (state.roundSecondsLeft <= 1) {
        playSfx("countdownComplete", { volume: 0.95 });
        const customersAtEnd = customersRef.current;
        clearCustomerLeaveTimers();
        if (customersAtEnd.length > 0) {
          window.setTimeout(() => {
            playSfx("angryCustomerLeave", { volume: 0.95 });
          }, 140);
          applyServeOutcome(0, -5 * customersAtEnd.length);
          setOrdersExpired((count) => count + customersAtEnd.length);
          void markLevelOneTutorialMessage(
            "firstOrderExpired",
            "⏰ Too late! The customer left. Watch the timer!",
          );

          for (const customer of customersAtEnd) {
            void emitGameEvent({
              eventName: "order_expired",
              sessionId: state.sessionId,
              level: state.level,
              payload: {
                order_id: customer.orderId,
                dishes_pending: getPendingDishes(customer),
                reputation_lost: 5,
              },
            });

            void emitGameEvent({
              eventName: "customer_left",
              sessionId: state.sessionId,
              level: state.level,
              payload: {
                customer_id: customer.customerId,
                left_reason: "round_ended",
                satisfaction_score: 0,
              },
            });
          }
        }

        setActiveCustomers([]);
        setRoundActive(false);
        const finalState = useGameStore.getState();
        const stars = getStarRating(finalState.revenue, finalState.level);
        const summary: RoundSummary = {
          level: finalState.level,
          revenue: finalState.revenue,
          reputation: finalState.reputation,
          stars,
          ordersServed: ordersServedRef.current,
          ordersExpired: ordersExpiredRef.current + customersAtEnd.length,
        };
        setRoundResult(summary);
        playSfx("success", { volume: 0.95 });
        if (summary.revenue >= currentLevelConfig.minScore) {
          playSfx("levelComplete", { volume: 0.95 });
        }
        setFeedback(
          `Round Complete! Total Revenue: ₹${finalState.revenue} | Reputation: ${finalState.reputation}`,
        );

        onRoundComplete?.({
          ...summary,
        });
        void emitGameEvent({
          eventName: "level_completed",
          sessionId: finalState.sessionId,
          level: finalState.level,
          payload: {
            total_coins: finalState.revenue,
            total_reputation: finalState.reputation,
            orders_served: ordersServedRef.current,
            orders_expired: ordersExpiredRef.current + customersAtEnd.length,
            stars_earned: stars,
          },
        });

        if (roundStartAt) {
          void emitGameEvent({
            eventName: "session_end",
            sessionId: finalState.sessionId,
            level: finalState.level,
            payload: {
              total_playtime_ms: now - roundStartAt,
              levels_completed: 1,
              final_score: finalState.revenue,
            },
          });
        }
        return;
      }

      if (state.roundSecondsLeft === 4 && !countdownStartedRef.current) {
        countdownStartedRef.current = true;
        playSfx("countdown5432", { volume: 0.95 });
      }

      tickRound();

      const expired = customersRef.current.filter(
        (customer) =>
          customer.phase === "waiting" &&
          !customer.leavingReason &&
          customer.deadlineAt <= now &&
          getPendingDishes(customer).length > 0,
      );
      if (expired.length === 0) {
        return;
      }

      setActiveCustomers((prev) =>
        prev.map((customer) =>
          expired.some((item) => item.orderId === customer.orderId)
            ? { ...customer, leavingReason: "expired" }
            : customer,
        ),
      );
      setOrdersExpired((count) => count + expired.length);
      applyServeOutcome(0, -5 * expired.length);
      playSfx("angryCustomerLeave", { volume: 0.95 });
      setFeedback(
        expired.length === 1
          ? "😡 Customer got upset and is leaving."
          : "😡 Some customers got upset and are leaving.",
      );
      if (expired.length > 0) {
        void markLevelOneTutorialMessage(
          "firstOrderExpired",
          "⏰ Too late! The customer left. Watch the timer!",
        );
      }

      for (const customer of expired) {
        void emitGameEvent({
          eventName: "order_expired",
          sessionId: state.sessionId,
          level: state.level,
          payload: {
            order_id: customer.orderId,
            dishes_pending: getPendingDishes(customer),
            reputation_lost: 5,
          },
        });

        void emitGameEvent({
          eventName: "customer_left",
          sessionId: state.sessionId,
          level: state.level,
          payload: {
            customer_id: customer.customerId,
            left_reason: "order_expired",
            satisfaction_score: 10,
          },
        });

        const leaveTimerId = window.setTimeout(() => {
          setActiveCustomers((prev) =>
            prev.filter((item) => item.orderId !== customer.orderId),
          );
          customerLeaveTimersRef.current = customerLeaveTimersRef.current.filter(
            (id) => id !== leaveTimerId,
          );
        }, EXPIRED_CUSTOMER_FADE_MS);
        customerLeaveTimersRef.current.push(leaveTimerId);
      }
    }, 1000);

    return () => {
      window.clearInterval(tickTimer);
    };
  }, [
    applyServeOutcome,
    clearCustomerLeaveTimers,
    currentLevelConfig.minScore,
    markLevelOneTutorialMessage,
    onRoundComplete,
    roundActive,
    roundStartAt,
    tickRound,
  ]);

  const onFloorPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Mobile/tablet drag: move waiter by dragging on the floor.
    if (event.pointerType === "mouse") {
      return;
    }

    dragPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveWaiterToClientPoint(event.clientX, event.clientY);
  };

  const onFloorPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    moveWaiterToClientPoint(event.clientX, event.clientY);
  };

  const onFloorPointerUpOrCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    dragPointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onStartRound = async () => {
    clearCustomerLeaveTimers();
    levelOneTutorialRef.current = { ...DEFAULT_LEVEL_ONE_TUTORIAL_FLAGS };
    countdownStartedRef.current = false;
    setRoundResult(null);
    resetRound();
    resetWaiterPosition();
    setActiveCustomers([]);
    setOrdersServed(0);
    setOrdersExpired(0);
    setCounterCooldowns(createCounterCooldowns());
    setRoundStartAt(nowMs());
    setFeedback("Round started. Seat guests and serve quickly.");
    setRoundActive(true);

    await emitGameEvent({
      eventName: "session_start",
      sessionId,
      level,
      payload: { player_id: "local-player" },
    });
  };

  const onPlayNextLevel = () => {
    const nextLevel = Math.min(level + 1, maxLevel);
    clearCustomerLeaveTimers();
    countdownStartedRef.current = false;
    setRoundResult(null);
    setRoundActive(false);
    setActiveCustomers([]);
    setOrdersServed(0);
    setOrdersExpired(0);
    setRoundStartAt(null);
    setCounterCooldowns(createCounterCooldowns());
    setLevel(nextLevel);
    resetSession();
    resetWaiterPosition();
    setFeedback(
      nextLevel > level
        ? `Level ${nextLevel} ready. Press Start Round.`
        : "Expert shift ready. Press Start Round.",
    );
  };

  const onPickDishFromCounter = useCallback(
    async (dish: DishName) => {
      if (!roundActive) {
        setFeedback("Start the round first.");
        return;
      }

      const distance = getDistanceToCounterDish(dish);
      if (distance > COUNTER_PICK_DISTANCE_PX) {
        setFeedback("Move waiter close to the counter slot to pick that dish.");
        return;
      }

      const selectedDishInSlot =
        selectedPlateSlot === null ? null : (plateSlots[selectedPlateSlot]?.dish ?? null);
      if (selectedDishInSlot === dish) {
        const removed = clearSelectedPlate();
        if (!removed) {
          setFeedback("No selected dish to unselect.");
          return;
        }

        setFeedback(`${DISH_ASSETS[dish].label} unselected and returned to counter.`);

        await emitGameEvent({
          eventName: "dish_discarded",
          sessionId,
          level,
          payload: {
            dish_name: dish,
            plate_slot: removed.slot,
            reason: "returned_to_counter",
          },
        });
        return;
      }

      const now = nowMs();
      const cooldownUntil = counterCooldowns[dish] ?? 0;
      if (cooldownUntil > now) {
        setFeedback(
          `${DISH_ASSETS[dish].label} is being replenished. Ready in ${Math.ceil(
            (cooldownUntil - now) / 1000,
          )}s.`,
        );
        return;
      }

      const slot = addDishToFirstEmptySlot(dish);
      if (slot === null) {
        setFeedback("No free plate slots. Serve or discard first.");
        return;
      }

      setCounterCooldowns((prev) => ({
        ...prev,
        [dish]: now + COUNTER_RESPAWN_MS,
      }));
      playSfx("dishSelect", { volume: 0.9 });
      setFeedback(`${DISH_ASSETS[dish].label} picked. Counter refills in 3s.`);

      await emitGameEvent({
        eventName: "dish_selected",
        sessionId,
        level,
        payload: {
          order_id: "pending-order",
          dish_name: dish,
          plate_slot: slot,
        },
      });
    },
    [
      addDishToFirstEmptySlot,
      clearSelectedPlate,
      counterCooldowns,
      getDistanceToCounterDish,
      level,
      plateSlots,
      roundActive,
      selectedPlateSlot,
      sessionId,
    ],
  );

  const onServeTable = useCallback(
    async (tableId: string) => {
      if (!roundActive) {
        setFeedback("Start the round first.");
        return;
      }

      const nextCarriedSlot = plateSlots.find((slot) => slot.dish !== null);
      if (!nextCarriedSlot?.dish) {
        setFeedback("Pick at least one dish from the counter before serving.");
        return;
      }

      const customer = customersRef.current.find(
        (item) => item.tableId === tableId && item.phase === "waiting",
      );
      if (!customer) {
        setFeedback("That table is empty.");
        return;
      }
      if (customer.leavingReason) {
        setFeedback("This customer is already leaving.");
        return;
      }

      if (!isWaiterNearTable(tableId)) {
        setFeedback("Move the waiter closer to this table to serve.");
        return;
      }

      const servedDish = nextCarriedSlot.dish as DishName;

      if (!isDishPending(customer, servedDish)) {
        if (
          !markLevelOneTutorialMessage(
            "firstWrongDish",
            "❌ Wrong dish! Click the dustbin to discard and try again.",
          )
        ) {
          setFeedback("Wrong dish for this table. Discard or serve another table.");
        }
        return;
      }

      clearPlateSlot(nextCarriedSlot.index);

      const serveTimeMs = nowMs() - customer.placedAt;
      const outcome = getScoreOutcomeByServeTime(serveTimeMs);
      playSfx("dishServed", { volume: 0.9 });
      applyServeOutcome(outcome.coins, outcome.reputation);
      spawnCoinBurst(tableId, servedDish, outcome.coins);
      let tutorialServeMessage: string | null = null;
      if (
        outcome.speedTier === "green" &&
        markLevelOneTutorialMessage(
          "firstFastServe",
          "🟢 Perfect! Fast service = More coins! (+200 coins, +10 reputation)",
        )
      ) {
        tutorialServeMessage =
          "🟢 Perfect! Fast service = More coins! (+200 coins, +10 reputation)";
      } else if (
        outcome.speedTier === "red" &&
        markLevelOneTutorialMessage(
          "firstSlowServe",
          "🔴 A bit slow. Try to serve faster next time! (+20 coins, +1 reputation)",
        )
      ) {
        tutorialServeMessage =
          "🔴 A bit slow. Try to serve faster next time! (+20 coins, +1 reputation)";
      }

      void emitGameEvent({
        eventName: "order_served",
        sessionId,
        level,
        payload: {
          order_id: customer.orderId,
          dish_name: servedDish,
          serve_time_ms: serveTimeMs,
          speed_tier: outcome.speedTier,
          coins: outcome.coins,
          reputation: outcome.reputation,
        },
      });

      const updatedCustomer: ActiveCustomer = {
        ...customer,
        dishesServed: [...customer.dishesServed, servedDish],
      };

      const completed = getPendingDishes(updatedCustomer).length === 0;
      if (!completed) {
        customersRef.current = customersRef.current.map((item) =>
          item.orderId === customer.orderId ? updatedCustomer : item,
        );
        setActiveCustomers(customersRef.current);
        setFeedback(tutorialServeMessage ?? "Partial order complete. Serve the remaining dish.");
        return;
      }

      setOrdersServed((count) => count + 1);
      customersRef.current = customersRef.current.map((item) =>
        item.orderId === customer.orderId ? updatedCustomer : item,
      );
      setActiveCustomers(customersRef.current);
      setFeedback(tutorialServeMessage ?? "Order completed.");

      void emitGameEvent({
        eventName: "order_completed",
        sessionId,
        level,
        payload: {
          order_id: updatedCustomer.orderId,
          total_serve_time_ms: serveTimeMs,
          total_coins: outcome.coins,
          stars: getStarRating(revenue, level),
        },
      });

      const leaveTimerId = window.setTimeout(() => {
        customersRef.current = customersRef.current.filter(
          (item) => item.orderId !== updatedCustomer.orderId,
        );
        setActiveCustomers(customersRef.current);
        void emitGameEvent({
          eventName: "customer_left",
          sessionId,
          level,
          payload: {
            customer_id: updatedCustomer.customerId,
            left_reason: "served",
            satisfaction_score: 95,
          },
        });
        customerLeaveTimersRef.current = customerLeaveTimersRef.current.filter(
          (id) => id !== leaveTimerId,
        );
      }, CUSTOMER_LEAVE_DELAY_MS);
      customerLeaveTimersRef.current.push(leaveTimerId);
    },
    [
      applyServeOutcome,
      clearPlateSlot,
      isWaiterNearTable,
      level,
      markLevelOneTutorialMessage,
      plateSlots,
      revenue,
      roundActive,
      sessionId,
      spawnCoinBurst,
    ],
  );

  const onServeNearestTable = useCallback(async (): Promise<boolean> => {
    if (!roundActive) {
      setFeedback("Start the round first.");
      return false;
    }

    const closest = activeCustomers
      .filter((customer) => customer.phase === "waiting" && !customer.leavingReason)
      .map((customer) => ({
        tableId: customer.tableId,
        distance: getDistanceToTable(customer.tableId),
      }))
      .filter((item) => item.distance <= SERVE_DISTANCE_PX)
      .sort((a, b) => a.distance - b.distance)[0];

    if (!closest) {
      return false;
    }

    await onServeTable(closest.tableId);
    return true;
  }, [activeCustomers, getDistanceToTable, onServeTable, roundActive]);

  const onPrimaryAction = useCallback(async () => {
    if (!roundActive) {
      setFeedback("Start the round first.");
      return;
    }

    const nearbyDish = getNearestCounterDishAtPosition(waiterPos.x, waiterPos.y);
    if (nearbyDish) {
      await onPickDishFromCounter(nearbyDish);
      return;
    }

    const served = await onServeNearestTable();
    if (served) {
      return;
    }

    setFeedback("Move closer to a counter dish or guest table.");
  }, [
    getNearestCounterDishAtPosition,
    onPickDishFromCounter,
    onServeNearestTable,
    roundActive,
    waiterPos.x,
    waiterPos.y,
  ]);

  useEffect(() => {
    const onServeHotkey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      if (event.repeat) {
        return;
      }

      event.preventDefault();
      void onPrimaryAction();
    };

    window.addEventListener("keydown", onServeHotkey);
    return () => {
      window.removeEventListener("keydown", onServeHotkey);
    };
  }, [onPrimaryAction]);

  const onDiscardSelectedDish = async () => {
    const selected = clearSelectedPlate();
    if (!selected) {
      setFeedback("Select a plated dish to discard.");
      return;
    }

    playSfx("dustbinThrow", { volume: 0.9 });
    setFeedback("Dish discarded.");
    await emitGameEvent({
      eventName: "dish_discarded",
      sessionId,
      level,
      payload: {
        dish_name: selected.dish,
        plate_slot: selected.slot,
        reason: "player_discarded",
      },
    });
  };

  const tablePositions = useMemo(
    () => getTablePositions(currentLevelConfig.seats),
    [currentLevelConfig.seats],
  );
  const selectedDish = useMemo(
    () => (selectedPlateSlot === null ? null : (plateSlots[selectedPlateSlot]?.dish ?? null)),
    [plateSlots, selectedPlateSlot],
  );
  const analyticsHref = useMemo(() => `/dashboard?session=${sessionId}`, [sessionId]);
  const tableCenterBounds = useMemo(() => {
    if (arenaMetrics.floorHeight <= 0) {
      return null;
    }

    const minY = Math.max(
      TABLE_HALF_HEIGHT_PX + 8,
      arenaMetrics.entranceBottom + TABLE_HALF_HEIGHT_PX + TABLE_TOP_SAFE_PADDING_PX,
    );
    const maxY = Math.max(
      minY,
      arenaMetrics.floorHeight - arenaMetrics.counterHeight - TABLE_HALF_HEIGHT_PX - 8,
    );
    return { minY, maxY };
  }, [arenaMetrics.counterHeight, arenaMetrics.entranceBottom, arenaMetrics.floorHeight]);

  return (
    <motion.section
      className="grid items-start gap-3 lg:gap-4 xl:justify-center xl:grid-cols-[minmax(0,calc(85vh*9/16*1.5))_minmax(320px,460px)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
    >
      <div>
        <div
          ref={floorRef}
          className="relative mx-auto h-[70vh] max-h-[90vh] w-auto aspect-[9/16] touch-none overflow-hidden rounded-2xl border border-amber-900/30 bg-amber-50 shadow-inner sm:h-[78vh] md:h-[84vh] xl:mx-0 xl:h-[88vh] xl:w-full xl:aspect-auto"
          onPointerDown={onFloorPointerDown}
          onPointerMove={onFloorPointerMove}
          onPointerUp={onFloorPointerUpOrCancel}
          onPointerCancel={onFloorPointerUpOrCancel}
        >
          <Image
            src={FLOOR_BACKGROUND}
            alt="Indian cafe floor"
            fill
            className="scale-[1.02] object-cover object-center opacity-90"
          />
          <div ref={entranceRef} className="absolute right-2 top-2 z-20 h-36 w-36">
            <Image src={ENTRANCE_DOOR} alt="Entrance" fill className="object-contain" />
          </div>

          <AnimatePresence initial={false}>
            {coinBursts.map((burst) => (
              <motion.div
                key={burst.id}
                className="pointer-events-none absolute z-[55] -translate-x-1/2"
                style={{ left: burst.x, top: burst.y }}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: -12, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="rounded-xl border border-emerald-700/20 bg-emerald-50/95 px-3 py-2 text-center shadow-md">
                  <p className="text-xs font-semibold text-emerald-900">
                    {DISH_ASSETS[burst.dish].label} is served
                  </p>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-xs font-bold text-emerald-800">
                    <span>+{burst.coins}</span>
                    <Image src={COIN_ICON} alt="Coin" width={14} height={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {tablePositions.map(({ tableId, xPercent, yPercent }) => {
            const customer = activeCustomers.find(
              (item) => item.tableId === tableId && item.phase !== "walking",
            );
            const pending = customer ? getPendingDishes(customer) : [];
            const remainingMs = customer ? Math.max(0, customer.deadlineAt - clockMs) : 0;
            const elapsed = ORDER_DURATION_SECONDS - Math.ceil(remainingMs / 1000);
            const timerColor =
              elapsed < 5 ? "bg-emerald-500" : elapsed < 10 ? "bg-yellow-500" : "bg-red-500";
            const patienceWidth = customer
              ? `${Math.max(0, (remainingMs / (ORDER_DURATION_SECONDS * 1000)) * 100)}%`
              : "0%";
            const tableTopPx = tableCenterBounds
              ? tableCenterBounds.minY +
                (yPercent / 100) * (tableCenterBounds.maxY - tableCenterBounds.minY)
              : null;

            return (
                <button
                  key={tableId}
                  ref={(node) => {
                    tableRefs.current[tableId] = node;
                  }}
                  type="button"
                  onClick={() => void onServeTable(tableId)}
                  className="absolute z-10 h-[187px] w-[173px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-transparent text-center transition hover:scale-[1.02] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{
                    left: `${xPercent}%`,
                    top: tableTopPx === null ? `${yPercent}%` : `${tableTopPx}px`,
                  }}
                >
                <div className="relative h-full w-full">
                  <div
                    className="absolute left-1/2 h-[115px] w-[115px] -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${TABLE_SPRITE_TOP_PERCENT}%` }}
                  >
                    <Image
                      src={TABLE_SPRITE}
                      alt="Table"
                      fill
                      className="object-contain mix-blend-multiply"
                    />
                  </div>

                  {customer && (
                    <>
                      <motion.div
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ top: `${CUSTOMER_TOP_PERCENT}%` }}
                        initial={false}
                        animate={
                          customer.leavingReason === "expired"
                            ? { opacity: 0, scale: 0.92, y: -6 }
                            : { opacity: 1, scale: 1, y: 0 }
                        }
                        transition={{
                          duration:
                            customer.leavingReason === "expired"
                              ? EXPIRED_CUSTOMER_FADE_MS / 1000
                              : 0.2,
                          ease: "easeOut",
                        }}
                      >
                        <Image
                          src={customer.spritePath}
                          alt="Customer"
                          width={CUSTOMER_SIZE_PX}
                          height={CUSTOMER_SIZE_PX}
                          className="h-[106px] w-[106px] object-contain mix-blend-multiply"
                        />
                      </motion.div>

                      {customer.leavingReason === "expired" ? (
                        <motion.div
                          className="absolute left-1/2 top-0 w-[148px] -translate-x-1/2 rounded-md border border-red-900/20 bg-red-50/95 px-2 py-2 text-center"
                          initial={false}
                          animate={{ opacity: 0, y: -8 }}
                          transition={{
                            duration: EXPIRED_CUSTOMER_FADE_MS / 1000,
                            ease: "easeOut",
                          }}
                        >
                          <span className="text-2xl">😡</span>
                        </motion.div>
                      ) : (
                        <div
                          className="absolute left-1/2 w-[148px] -translate-x-1/2 rounded-md border border-amber-900/15 bg-white/95 px-2 py-1"
                          style={{ top: `${ORDER_BUBBLE_TOP_PERCENT}%` }}
                        >
                          <div className="relative mb-1 h-2 w-full overflow-hidden rounded bg-amber-100">
                            <div
                              className={`h-2 rounded ${timerColor}`}
                              style={{ width: patienceWidth }}
                            />
                          </div>
                          <div className="relative flex items-center justify-center gap-2">
                            <Image
                              src={SPEECH_BUBBLE}
                              alt=""
                              fill
                              className="pointer-events-none object-cover opacity-10"
                            />
                            {customer.dishesRequested.map((dish, index) => {
                              const done = isDishServedAtIndex(customer, index);
                              return (
                                <div
                                  key={`${customer.orderId}-${dish}-${index}`}
                                  className="relative z-10"
                                >
                                  <Image
                                    src={DISH_ASSETS[dish].image}
                                    alt={DISH_ASSETS[dish].label}
                                    width={32}
                                    height={32}
                                    className={pending.includes(dish) ? "" : "opacity-65"}
                                  />
                                  {done && (
                                    <Image
                                      src={GREEN_CHECK}
                                      alt="Done"
                                      width={16}
                                      height={16}
                                      className="absolute -bottom-1 -right-1"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}

          {activeCustomers
            .filter((customer) => customer.phase === "walking")
            .map((customer) => {
              const target = tablePositions.find((table) => table.tableId === customer.tableId);
              if (!target) {
                return null;
              }
              const tableSpriteYOffsetPx = ((TABLE_SPRITE_TOP_PERCENT - 50) / 100) * TABLE_HEIGHT_PX;
              const tableCenterYPx =
                tableCenterBounds && arenaMetrics.floorHeight > 0
                  ? tableCenterBounds.minY +
                    (target.yPercent / 100) * (tableCenterBounds.maxY - tableCenterBounds.minY)
                  : (target.yPercent / 100) * Math.max(arenaMetrics.floorHeight, 1);
              const targetYPercent =
                arenaMetrics.floorHeight > 0
                  ? clamp(((tableCenterYPx + tableSpriteYOffsetPx) / arenaMetrics.floorHeight) * 100, 0, 100)
                  : clamp(target.yPercent, 0, 100);
              const progressRaw =
                1 -
                Math.max(0, customer.walkArriveAt - clockMs) /
                  Math.max(1, CUSTOMER_WALK_DURATION_MS);
              const progress = clamp(progressRaw, 0, 1);
              const xPercent =
                ENTRANCE_X_PERCENT + (target.xPercent - ENTRANCE_X_PERCENT) * progress;
              const yPercent =
                ENTRANCE_Y_PERCENT + (targetYPercent - ENTRANCE_Y_PERCENT) * progress;

              return (
                <div
                  key={`${customer.orderId}-walking`}
                  className="pointer-events-none absolute z-[25] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                >
                  <Image
                    src={customer.standingSpritePath}
                    alt="Walking customer"
                    width={CUSTOMER_SIZE_PX}
                    height={CUSTOMER_SIZE_PX}
                    className="h-[106px] w-[106px] object-contain"
                  />
                </div>
              );
            })}

          <div
            className="absolute z-40"
            style={{
              left: `${waiterPos.x - WAITER_HALF}px`,
              top: `${waiterPos.y - WAITER_HALF}px`,
            }}
          >
            <div
              className="relative overflow-hidden rounded-lg"
              style={{ height: `${WAITER_SIZE}px`, width: `${WAITER_SIZE}px` }}
            >
              <Image
                src={WAITER_SPRITE}
                alt="Waiter"
                fill
                className="object-contain mix-blend-multiply"
              />
            </div>
          </div>

          <div
            ref={counterRef}
            className="absolute bottom-0 left-0 right-0 z-30 border-t border-amber-900/70 p-3"
            style={{
              backgroundImage:
                "linear-gradient(rgba(70,37,23,0.72), rgba(70,37,23,0.72)), repeating-linear-gradient(90deg, #8a512f 0 16px, #744327 16px 32px)",
            }}
          >
            <div className="grid grid-cols-5 gap-1">
              {DISHES.map((dish) => {
                const cooldownUntil = counterCooldowns[dish] ?? 0;
                const isReady = cooldownUntil <= clockMs;

                return (
                  <button
                    key={dish}
                    ref={(node) => {
                      counterDishRefs.current[dish] = node;
                    }}
                    type="button"
                    onClick={() => void onPickDishFromCounter(dish)}
                    className="rounded-lg border border-transparent bg-transparent p-1 text-center transition focus-visible:outline-none focus-visible:ring-0"
                  >
                    <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center">
                      <AnimatePresence initial={false} mode="wait">
                        <motion.div
                          key={isReady ? `${dish}-ready` : `${dish}-empty`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Image
                            src={isReady ? DISH_ASSETS[dish].image : EMPTY_PLATE_ICON}
                            alt={DISH_ASSETS[dish].label}
                            width={66}
                            height={66}
                            className={`${
                              isReady
                                ? nearCounterDish === dish
                                  ? "drop-shadow-[0_0_26px_rgba(255,255,255,0.72)]"
                                  : "drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)]"
                                : "opacity-70"
                            }`}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.14em] text-amber-50">
              Service Counter
            </p>
          </div>
        </div>
      </div>

      <aside className="space-y-3 xl:sticky xl:top-24">
        <div className="panel border-[color:var(--saffron)] p-4">
          <p className="text-xs uppercase tracking-wide text-amber-950/65">Controls</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                playSfx("menuTouch", { volume: 0.7 });
                void onStartRound();
              }}
            >
              Start Round
            </button>
            <button
              type="button"
              className="btn-secondary border-[color:var(--maroon)]"
              onClick={() => {
                playSfx("menuTouch", { volume: 0.7 });
                void onDiscardSelectedDish();
              }}
            >
              <span className="flex items-center gap-2">
                <Image src={DUSTBIN_ICON} alt="Dustbin" width={16} height={16} />
                <span>Discard</span>
              </span>
            </button>
          </div>
          {feedback ? <p className="mt-1 text-sm text-amber-950/70">{feedback}</p> : null}
        </div>

        <GameHud
          level={level}
          roundSecondsLeft={roundSecondsLeft}
          revenue={revenue}
          reputation={reputation}
          selectedDish={selectedDish}
        />

        <div className="panel border-[color:var(--gold)] p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-amber-950/65">Plate Slots</p>
          <PlateSlots
            plateSlots={plateSlots}
            selectedPlateSlot={selectedPlateSlot}
            onSelectSlot={(slot) =>
              setSelectedPlateSlot(selectedPlateSlot === slot ? null : slot)
            }
          />
          <div className="mt-3 border-t border-amber-900/15 pt-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-amber-950/65">
              Dishes Served
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DISHES.map((dish) => (
                <div
                  key={dish}
                  className="flex flex-col items-center rounded-xl border border-amber-900/15 bg-white/85 px-2 py-3 text-center shadow-[0_4px_10px_rgba(60,37,18,0.12)]"
                >
                  <Image
                    src={DISH_ASSETS[dish].image}
                    alt={DISH_ASSETS[dish].label}
                    width={70}
                    height={70}
                    className="h-[70px] w-[70px] object-contain drop-shadow-[0_6px_10px_rgba(60,37,18,0.28)]"
                  />
                  <span className="mt-2 text-base font-semibold text-amber-950">
                    {DISH_ASSETS[dish].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </aside>

      <AnimatePresence>
        {roundResult && (
          <motion.div
            className="fixed inset-0 z-[160] flex items-end justify-center overflow-y-auto bg-amber-950/45 px-4 py-4 sm:items-center sm:py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="panel max-h-[88vh] w-full max-w-lg overflow-y-auto border-[color:var(--gold)] bg-[linear-gradient(145deg,rgba(255,250,242,0.95),rgba(255,235,208,0.94))] p-4 text-center shadow-[0_24px_50px_rgba(55,32,15,0.36)] sm:p-6"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-amber-950/70">Shift Closed</p>
              <h3 className="mt-1 font-[var(--font-baloo)] text-3xl text-amber-950 sm:text-4xl">
                Service Summary
              </h3>
              <p className="mt-2 text-sm font-semibold text-amber-950">
                {roundResult.revenue >= currentLevelConfig.minScore
                  ? "Great shift. You hit the revenue target for this level."
                  : `Target not reached. Need ₹${currentLevelConfig.minScore - roundResult.revenue} more to clear this level.`}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-xl bg-white/80 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-amber-950/65">Revenue</p>
                  <p className="text-lg font-bold text-amber-700">₹{roundResult.revenue}</p>
                </div>
                <div className="rounded-xl bg-white/80 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-amber-950/65">Reputation</p>
                  <p className="text-lg font-bold text-emerald-700">{roundResult.reputation}</p>
                </div>
                <div className="rounded-xl bg-white/80 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-amber-950/65">Served</p>
                  <p className="text-lg font-bold text-cyan-700">{roundResult.ordersServed}</p>
                </div>
                <div className="rounded-xl bg-white/80 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-amber-950/65">Expired</p>
                  <p className="text-lg font-bold text-rose-700">{roundResult.ordersExpired}</p>
                </div>
              </div>

              {roundResult.revenue >= currentLevelConfig.minScore ? (
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      playSfx("menuTouch", { volume: 0.7 });
                      void onStartRound();
                    }}
                  >
                    Start New Shift
                  </button>
                  <button
                    type="button"
                    className="btn-secondary border-[color:var(--gold)]"
                    onClick={() => {
                      playSfx("menuTouch", { volume: 0.7 });
                      onPlayNextLevel();
                    }}
                  >
                    {level < maxLevel ? "Play Next Level" : "Replay Expert Level"}
                  </button>
                  <Link
                    href={analyticsHref}
                    className="btn-secondary border-[color:var(--turquoise)]"
                    onClick={() => playSfx("menuTouch", { volume: 0.7 })}
                  >
                    View Analytics
                  </Link>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      playSfx("menuTouch", { volume: 0.7 });
                      void onStartRound();
                    }}
                  >
                    Start New Shift
                  </button>
                  <Link
                    href={analyticsHref}
                    className="btn-secondary border-[color:var(--turquoise)]"
                    onClick={() => playSfx("menuTouch", { volume: 0.7 })}
                  >
                    View Analytics
                  </Link>
                </div>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
