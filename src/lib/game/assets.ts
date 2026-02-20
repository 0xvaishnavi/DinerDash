import type { DishName } from "@/lib/game/types";

export interface DishAsset {
  label: string;
  image: string;
}

export const DISH_ASSETS: Record<DishName, DishAsset> = {
  chicken: {
    label: "Chicken Tikka",
    image: "/dish/chiken.png",
  },
  pizza: {
    label: "Pizza",
    image: "/dish/pizza.png",
  },
  ramen: {
    label: "Ramen",
    image: "/dish/ramen.png",
  },
  taco: {
    label: "Taco",
    image: "/dish/taco.png",
  },
  sushi: {
    label: "Sushi",
    image: "/dish/sushi.png",
  },
  chole_bhature: {
    label: "Chole Bhature",
    image: "/dish/chole-bhature.png",
  },
};

export const CUSTOMER_SPRITES = {
  young: ["/sprite/female-customer-1.png", "/sprite/female-customer-2.png"],
  traditional: ["/sprite/male-customer-1.png", "/sprite/male-customer-2.png"],
};

export const CUSTOMER_STANDING_SPRITES = {
  young: ["/sprite/female-customer-1-standing.png", "/sprite/female-customer-2-standing.png"],
  traditional: ["/sprite/male-customer-1-standing.png", "/sprite/male-customer-2-standing.png"],
};

export const WAITER_SPRITE = "/sprite/waiter.png";
export const TABLE_SPRITE = "/ui/wooden-table.png";
export const FLOOR_BACKGROUND = "/ui/background.png";
export const ENTRANCE_DOOR = "/ui/entrance-door.png";
export const DUSTBIN_ICON = "/elements/dustbin.png";
export const EMPTY_PLATE_ICON = "/elements/empty-plate.png";
export const COIN_ICON = "/elements/coin.png";
export const SPEECH_BUBBLE = "/effects/speech-bubble.png";
export const GREEN_CHECK = "/effects/green-checkmark.png";
