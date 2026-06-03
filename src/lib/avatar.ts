// Avatar parts catalog. Each part has an unlock level + coin cost.
// Items at level 1 with cost 0 are starter items (free).

export type AvatarSlot = "skin" | "hair" | "eyes" | "face" | "clothing" | "accessory" | "background";

export interface AvatarItem {
  id: string;
  slot: AvatarSlot;
  name: string;
  level: number; // unlock level
  cost: number; // coins to purchase (0 = free)
  // visual: for skin/clothing/background = color; for hair/eyes/face/accessory = emoji
  visual: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

export const AVATAR_ITEMS: AvatarItem[] = [
  // Skin tones (free starters)
  { id: "skin-1", slot: "skin", name: "Porcelain", level: 1, cost: 0, visual: "#f4d2b8" },
  { id: "skin-2", slot: "skin", name: "Honey", level: 1, cost: 0, visual: "#e0a878" },
  { id: "skin-3", slot: "skin", name: "Bronze", level: 1, cost: 0, visual: "#b07d56" },
  { id: "skin-4", slot: "skin", name: "Mahogany", level: 1, cost: 0, visual: "#7a4a2c" },
  { id: "skin-5", slot: "skin", name: "Espresso", level: 1, cost: 0, visual: "#4b2a1a" },

  // Hair (basic free, more at higher levels)
  { id: "hair-basic-1", slot: "hair", name: "Classic", level: 1, cost: 0, visual: "💇" },
  { id: "hair-basic-2", slot: "hair", name: "Buzz", level: 1, cost: 0, visual: "👨" },
  { id: "hair-curly", slot: "hair", name: "Curly", level: 5, cost: 150, visual: "👨‍🦱", rarity: "common" },
  { id: "hair-mohawk", slot: "hair", name: "Mohawk", level: 5, cost: 200, visual: "🤘", rarity: "common" },
  { id: "hair-rainbow", slot: "hair", name: "Rainbow", level: 20, cost: 800, visual: "🌈", rarity: "rare" },

  // Eyes
  { id: "eyes-default", slot: "eyes", name: "Default", level: 1, cost: 0, visual: "👀" },
  { id: "eyes-cool", slot: "eyes", name: "Shades", level: 1, cost: 0, visual: "🕶️" },
  { id: "eyes-star", slot: "eyes", name: "Starstruck", level: 10, cost: 400, visual: "🤩", rarity: "rare" },
  { id: "eyes-laser", slot: "eyes", name: "Laser", level: 30, cost: 1200, visual: "😎", rarity: "epic" },

  // Face / expression
  { id: "face-smile", slot: "face", name: "Smile", level: 1, cost: 0, visual: "🙂" },
  { id: "face-smirk", slot: "face", name: "Smirk", level: 1, cost: 0, visual: "😏" },
  { id: "face-fire", slot: "face", name: "On Fire", level: 30, cost: 1500, visual: "🔥", rarity: "epic" },

  // Clothing
  { id: "shirt-tee", slot: "clothing", name: "Tee", level: 1, cost: 0, visual: "#5b8def" },
  { id: "shirt-hoodie", slot: "clothing", name: "Hoodie", level: 10, cost: 500, visual: "#8b5cf6", rarity: "common" },
  { id: "shirt-letterman", slot: "clothing", name: "Letterman", level: 20, cost: 900, visual: "#ef4444", rarity: "rare" },
  { id: "shirt-gold", slot: "clothing", name: "Gold Chain", level: 50, cost: 3000, visual: "#fbbf24", rarity: "legendary" },

  // Accessories
  { id: "acc-none", slot: "accessory", name: "None", level: 1, cost: 0, visual: "" },
  { id: "acc-cap", slot: "accessory", name: "Cap", level: 1, cost: 0, visual: "🧢" },
  { id: "acc-crown", slot: "accessory", name: "Crown", level: 30, cost: 1500, visual: "👑", rarity: "epic" },
  { id: "acc-halo", slot: "accessory", name: "Halo", level: 75, cost: 5000, visual: "😇", rarity: "legendary" },
  { id: "acc-prestige", slot: "accessory", name: "Prestige Aura", level: 100, cost: 10000, visual: "✨", rarity: "legendary" },

  // Backgrounds
  { id: "bg-violet", slot: "background", name: "Violet", level: 1, cost: 0, visual: "linear-gradient(135deg,#6d28d9,#db2777)" },
  { id: "bg-ocean", slot: "background", name: "Ocean", level: 5, cost: 200, visual: "linear-gradient(135deg,#0ea5e9,#22d3ee)", rarity: "common" },
  { id: "bg-sunset", slot: "background", name: "Sunset", level: 20, cost: 700, visual: "linear-gradient(135deg,#f97316,#ec4899)", rarity: "rare" },
  { id: "bg-cyber", slot: "background", name: "Cyber", level: 50, cost: 3000, visual: "linear-gradient(135deg,#84cc16,#22d3ee)", rarity: "legendary" },
];

export const SLOTS: AvatarSlot[] = [
  "background",
  "skin",
  "hair",
  "eyes",
  "face",
  "clothing",
  "accessory",
];

export type AvatarEquipped = Partial<Record<AvatarSlot, string>>;

export function defaultAvatar(): AvatarEquipped {
  return {
    background: "bg-violet",
    skin: "skin-2",
    hair: "hair-basic-1",
    eyes: "eyes-default",
    face: "face-smile",
    clothing: "shirt-tee",
    accessory: "acc-none",
  };
}

export function defaultOwned(): string[] {
  return AVATAR_ITEMS.filter((i) => i.cost === 0 && i.level === 1).map((i) => i.id);
}

export function getItem(id?: string): AvatarItem | undefined {
  if (!id) return undefined;
  return AVATAR_ITEMS.find((i) => i.id === id);
}
