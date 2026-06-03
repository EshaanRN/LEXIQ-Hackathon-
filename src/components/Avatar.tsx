import { getItem, type AvatarEquipped } from "@/lib/avatar";

interface Props {
  equipped: AvatarEquipped;
  size?: number;
  className?: string;
}

export function Avatar({ equipped, size = 96, className = "" }: Props) {
  const bg = getItem(equipped.background);
  const skin = getItem(equipped.skin);
  const hair = getItem(equipped.hair);
  const eyes = getItem(equipped.eyes);
  const face = getItem(equipped.face);
  const clothing = getItem(equipped.clothing);
  const acc = getItem(equipped.accessory);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-border ${className}`}
      style={{
        width: size,
        height: size,
        background: bg?.visual ?? "var(--surface-2)",
      }}
    >
      {/* head */}
      <div
        className="absolute left-1/2 top-[18%] -translate-x-1/2 rounded-full"
        style={{
          width: size * 0.62,
          height: size * 0.62,
          background: skin?.visual ?? "#e0a878",
        }}
      />
      {/* clothing collar */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full"
        style={{
          width: size * 0.9,
          height: size * 0.35,
          background: clothing?.visual ?? "#5b8def",
        }}
      />
      {/* hair */}
      {hair && (
        <span
          className="absolute left-1/2 -translate-x-1/2 select-none leading-none"
          style={{ top: size * 0.04, fontSize: size * 0.38 }}
        >
          {hair.visual}
        </span>
      )}
      {/* eyes */}
      {eyes && (
        <span
          className="absolute left-1/2 -translate-x-1/2 select-none leading-none"
          style={{ top: size * 0.32, fontSize: size * 0.22 }}
        >
          {eyes.visual}
        </span>
      )}
      {/* face */}
      {face && (
        <span
          className="absolute left-1/2 -translate-x-1/2 select-none leading-none"
          style={{ top: size * 0.5, fontSize: size * 0.22 }}
        >
          {face.visual}
        </span>
      )}
      {/* accessory */}
      {acc && acc.visual && (
        <span
          className="absolute left-1/2 -translate-x-1/2 select-none leading-none drop-shadow"
          style={{ top: -size * 0.04, fontSize: size * 0.34 }}
        >
          {acc.visual}
        </span>
      )}
    </div>
  );
}
