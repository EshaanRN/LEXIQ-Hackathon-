// DiceBear-based avatar system. Each user stores an AvatarConfig.
// Shop items unlock additional styles, premium presets, or backgrounds.

export const DICEBEAR_STYLES = [
  // Free
  { id: "adventurer", name: "Adventurer", free: true },
  { id: "adventurer-neutral", name: "Adventurer N.", free: true },
  { id: "avataaars", name: "Classic", free: true },
  { id: "big-smile", name: "Big Smile", free: true },
  { id: "fun-emoji", name: "Emoji", free: true },
  { id: "lorelei", name: "Lorelei", free: true },
  { id: "lorelei-neutral", name: "Lorelei N.", free: true },
  { id: "micah", name: "Micah", free: true },
  { id: "notionists", name: "Sketch", free: true },
  { id: "notionists-neutral", name: "Sketch N.", free: true },
  { id: "thumbs", name: "Thumbs", free: true },
  { id: "miniavs", name: "Mini", free: true },
  // Paid
  { id: "open-peeps", name: "Peeps", free: false, level: 5, cost: 250 },
  { id: "personas", name: "Persona", free: false, level: 8, cost: 400 },
  { id: "croodles", name: "Croodles", free: false, level: 10, cost: 500 },
  { id: "croodles-neutral", name: "Croodles N.", free: false, level: 12, cost: 600 },
  { id: "big-ears", name: "Big Ears", free: false, level: 14, cost: 700 },
  { id: "big-ears-neutral", name: "Big Ears N.", free: false, level: 14, cost: 700 },
  { id: "pixel-art", name: "Pixel", free: false, level: 15, cost: 800 },
  { id: "pixel-art-neutral", name: "Pixel N.", free: false, level: 15, cost: 800 },
  { id: "avataaars-neutral", name: "Classic N.", free: false, level: 18, cost: 1000 },
  { id: "dylan", name: "Dylan", free: false, level: 20, cost: 1200 },
  { id: "bottts", name: "Robo", free: false, level: 25, cost: 1500 },
  { id: "bottts-neutral", name: "Robo N.", free: false, level: 25, cost: 1500 },
  { id: "glass", name: "Glass", free: false, level: 30, cost: 2000 },
  { id: "icons", name: "Icons", free: false, level: 35, cost: 2500 },
  { id: "shapes", name: "Shapes", free: false, level: 40, cost: 3000 },
  { id: "rings", name: "Rings", free: false, level: 45, cost: 3500 },
  { id: "identicon", name: "Identicon", free: false, level: 50, cost: 4000 },
  { id: "initials", name: "Initials", free: false, level: 55, cost: 4500 },
] as const;

export type DicebearStyleId = (typeof DICEBEAR_STYLES)[number]["id"];

export const BACKGROUND_PALETTES: { id: string; name: string; colors: string[]; level: number; cost: number; rarity?: "common" | "rare" | "epic" | "legendary" }[] = [
  // Free
  { id: "bg-aurora", name: "Aurora", colors: ["b6e3f4", "c0aede", "d1d4f9"], level: 1, cost: 0 },
  { id: "bg-sunset", name: "Sunset", colors: ["ffd5dc", "ffdfbf"], level: 1, cost: 0 },
  { id: "bg-mint", name: "Mint", colors: ["b6e3f4", "d1d4f9"], level: 1, cost: 0 },
  { id: "bg-cloud", name: "Cloud", colors: ["e0e7ff", "f1f5f9"], level: 1, cost: 0 },
  // Common
  { id: "bg-lime", name: "Electric Lime", colors: ["dffe61", "9af764"], level: 3, cost: 150, rarity: "common" },
  { id: "bg-peach", name: "Peach Fuzz", colors: ["ffcfb5", "ffb088"], level: 4, cost: 200, rarity: "common" },
  { id: "bg-rose", name: "Rose Quartz", colors: ["fbcfe8", "f9a8d4"], level: 5, cost: 250, rarity: "common" },
  // Rare
  { id: "bg-magenta", name: "Magenta", colors: ["ff6ad5", "ff8b94"], level: 10, cost: 500, rarity: "rare" },
  { id: "bg-ocean", name: "Deep Ocean", colors: ["0ea5e9", "1e40af"], level: 12, cost: 650, rarity: "rare" },
  { id: "bg-forest", name: "Forest", colors: ["166534", "065f46"], level: 14, cost: 750, rarity: "rare" },
  { id: "bg-amber", name: "Amber Glow", colors: ["fb923c", "ea580c"], level: 18, cost: 1000, rarity: "rare" },
  // Epic
  { id: "bg-cyber", name: "Cyber", colors: ["00f5d4", "00bbf9"], level: 25, cost: 1500, rarity: "epic" },
  { id: "bg-galaxy", name: "Galaxy", colors: ["6d28d9", "1e1b4b", "3730a3"], level: 30, cost: 2000, rarity: "epic" },
  { id: "bg-lava", name: "Lava", colors: ["dc2626", "7c2d12"], level: 35, cost: 2500, rarity: "epic" },
  // Legendary
  { id: "bg-gold", name: "Liquid Gold", colors: ["fbbf24", "f59e0b", "fde047"], level: 50, cost: 5000, rarity: "legendary" },
  { id: "bg-prism", name: "Prism", colors: ["f472b6", "a78bfa", "60a5fa", "34d399"], level: 60, cost: 6000, rarity: "legendary" },
  { id: "bg-void", name: "Void", colors: ["1a1a2e", "16213e", "0f3460"], level: 75, cost: 7500, rarity: "legendary" },
  { id: "bg-nebula", name: "Nebula", colors: ["7c3aed", "db2777", "0ea5e9"], level: 90, cost: 9000, rarity: "legendary" },
];

export const PRESET_AVATARS: { id: string; name: string; style: DicebearStyleId; seed: string; backgroundColor: string[]; level: number; cost: number; rarity: "common" | "rare" | "epic" | "legendary" }[] = [
  { id: "preset-scholar", name: "Night Scholar", style: "personas", seed: "NightScholar", backgroundColor: ["1a1a2e", "16213e"], level: 8, cost: 400, rarity: "common" },
  { id: "preset-streamer", name: "Neon Streamer", style: "personas", seed: "NeonStream", backgroundColor: ["ff6ad5", "ff8b94"], level: 12, cost: 600, rarity: "rare" },
  { id: "preset-coder", name: "Pixel Coder", style: "pixel-art", seed: "PixelCoder", backgroundColor: ["00f5d4", "00bbf9"], level: 20, cost: 1200, rarity: "epic" },
  { id: "preset-astro", name: "Astronaut", style: "open-peeps", seed: "Astronaut", backgroundColor: ["6d28d9", "1e1b4b"], level: 22, cost: 1400, rarity: "epic" },
  { id: "preset-ninja", name: "Shadow Ninja", style: "bottts", seed: "ShadowNinja", backgroundColor: ["1a1a2e", "16213e"], level: 28, cost: 1800, rarity: "epic" },
  { id: "preset-mage", name: "Arcane Mage", style: "personas", seed: "ArcaneMage", backgroundColor: ["7c3aed", "db2777"], level: 35, cost: 2400, rarity: "epic" },
  { id: "preset-legend", name: "Golden Legend", style: "bottts", seed: "GoldLegend", backgroundColor: ["fbbf24", "f59e0b"], level: 60, cost: 5000, rarity: "legendary" },
  { id: "preset-cosmic", name: "Cosmic Sage", style: "shapes", seed: "CosmicSage", backgroundColor: ["7c3aed", "db2777", "0ea5e9"], level: 75, cost: 7000, rarity: "legendary" },
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
    seed: "preview-adventurer",
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
