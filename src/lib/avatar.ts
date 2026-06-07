// DiceBear-based avatar system. Each user stores an AvatarConfig.
// Shop items unlock additional styles, premium presets, or backgrounds.

export const DICEBEAR_STYLES = [
  { id: "adventurer", name: "Adventurer", free: true },
  { id: "avataaars", name: "Classic", free: true },
  { id: "big-smile", name: "Big Smile", free: true },
  { id: "fun-emoji", name: "Emoji", free: true },
  { id: "lorelei", name: "Lorelei", free: true },
  { id: "micah", name: "Micah", free: true },
  { id: "notionists", name: "Sketch", free: true },
  { id: "personas", name: "Persona", free: false, level: 8, cost: 400 },
  { id: "pixel-art", name: "Pixel", free: false, level: 15, cost: 800 },
  { id: "bottts", name: "Robo", free: false, level: 25, cost: 1500 },
  { id: "shapes", name: "Shapes", free: false, level: 40, cost: 3000 },
] as const;

export type DicebearStyleId = (typeof DICEBEAR_STYLES)[number]["id"];

export const BACKGROUND_PALETTES: { id: string; name: string; colors: string[]; level: number; cost: number; rarity?: "common" | "rare" | "epic" | "legendary" }[] = [
  { id: "bg-aurora", name: "Aurora", colors: ["b6e3f4", "c0aede", "d1d4f9"], level: 1, cost: 0 },
  { id: "bg-sunset", name: "Sunset", colors: ["ffd5dc", "ffdfbf"], level: 1, cost: 0 },
  { id: "bg-mint", name: "Mint", colors: ["b6e3f4", "d1d4f9"], level: 1, cost: 0 },
  { id: "bg-lime", name: "Electric Lime", colors: ["dffe61", "9af764"], level: 3, cost: 150, rarity: "common" },
  { id: "bg-magenta", name: "Magenta", colors: ["ff6ad5", "ff8b94"], level: 10, cost: 500, rarity: "rare" },
  { id: "bg-cyber", name: "Cyber", colors: ["00f5d4", "00bbf9"], level: 25, cost: 1500, rarity: "epic" },
  { id: "bg-gold", name: "Liquid Gold", colors: ["fbbf24", "f59e0b", "fde047"], level: 50, cost: 5000, rarity: "legendary" },
  { id: "bg-void", name: "Void", colors: ["1a1a2e", "16213e", "0f3460"], level: 75, cost: 7500, rarity: "legendary" },
];

export const PRESET_AVATARS: { id: string; name: string; style: DicebearStyleId; seed: string; backgroundColor: string[]; level: number; cost: number; rarity: "common" | "rare" | "epic" | "legendary" }[] = [
  { id: "preset-scholar", name: "Night Scholar", style: "personas", seed: "NightScholar", backgroundColor: ["1a1a2e", "16213e"], level: 8, cost: 400, rarity: "common" },
  { id: "preset-streamer", name: "Neon Streamer", style: "personas", seed: "NeonStream", backgroundColor: ["ff6ad5", "ff8b94"], level: 12, cost: 600, rarity: "rare" },
  { id: "preset-coder", name: "Pixel Coder", style: "pixel-art", seed: "PixelCoder", backgroundColor: ["00f5d4", "00bbf9"], level: 20, cost: 1200, rarity: "epic" },
  { id: "preset-legend", name: "Golden Legend", style: "bottts", seed: "GoldLegend", backgroundColor: ["fbbf24", "f59e0b"], level: 60, cost: 5000, rarity: "legendary" },
];

export interface AvatarConfig {
  style: DicebearStyleId;
  seed: string;
  backgroundColor: string[]; // hex codes WITHOUT '#'
  flip?: boolean;
  radius?: number;
}

export function defaultAvatar(): AvatarConfig {
  return {
    style: "adventurer",
    seed: randomSeed(),
    backgroundColor: ["b6e3f4", "c0aede"],
    radius: 50,
  };
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultOwned(): string[] {
  return [
    ...DICEBEAR_STYLES.filter((s) => s.free).map((s) => `style-${s.id}`),
    ...BACKGROUND_PALETTES.filter((b) => b.cost === 0).map((b) => b.id),
  ];
}

export function styleOwned(owned: string[], styleId: string) {
  const def = DICEBEAR_STYLES.find((s) => s.id === styleId);
  if (def?.free) return true;
  return owned.includes(`style-${styleId}`);
}

export function bgOwned(owned: string[], bgId: string) {
  const def = BACKGROUND_PALETTES.find((b) => b.id === bgId);
  if (def && def.cost === 0) return true;
  return owned.includes(bgId);
}

// Unified shop catalog
export type ShopItem =
  | { kind: "style"; id: string; name: string; level: number; cost: number; styleId: DicebearStyleId; rarity?: string }
  | { kind: "background"; id: string; name: string; level: number; cost: number; colors: string[]; rarity?: string }
  | { kind: "preset"; id: string; name: string; level: number; cost: number; style: DicebearStyleId; seed: string; backgroundColor: string[]; rarity: string };

export function getShopItems(): ShopItem[] {
  const styles: ShopItem[] = DICEBEAR_STYLES.filter((s) => !s.free).map((s) => ({
    kind: "style",
    id: `style-${s.id}`,
    name: s.name + " Style",
    level: s.level!,
    cost: s.cost!,
    styleId: s.id,
    rarity: s.cost! >= 2000 ? "legendary" : s.cost! >= 1000 ? "epic" : s.cost! >= 500 ? "rare" : "common",
  }));
  const bgs: ShopItem[] = BACKGROUND_PALETTES.filter((b) => b.cost > 0).map((b) => ({
    kind: "background",
    id: b.id,
    name: b.name + " BG",
    level: b.level,
    cost: b.cost,
    colors: b.colors,
    rarity: b.rarity,
  }));
  const presets: ShopItem[] = PRESET_AVATARS.map((p) => ({
    kind: "preset",
    id: p.id,
    name: p.name,
    level: p.level,
    cost: p.cost,
    style: p.style,
    seed: p.seed,
    backgroundColor: p.backgroundColor,
    rarity: p.rarity,
  }));
  return [...styles, ...bgs, ...presets];
}
