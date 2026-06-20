import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import type { AvatarConfig } from "@/lib/avatar";

interface Props {
  equipped: AvatarConfig;
  size?: number;
  className?: string;
}

const STYLE_MAP: Record<string, unknown> = styles as unknown as Record<string, unknown>;

function resolveStyle(id: string): unknown {
  // DiceBear exports are camelCase (e.g. "big-smile" → "bigSmile").
  const camel = id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return STYLE_MAP[id] ?? STYLE_MAP[camel] ?? styles.adventurer;
}

export function Avatar({ equipped, size = 96, className = "" }: Props) {
  const dataUri = useMemo(() => {
    const style = resolveStyle(equipped.style as string);
    try {
      const av = createAvatar(style as never, {
        seed: equipped.seed,
        backgroundColor: equipped.backgroundColor,
        radius: equipped.radius ?? 50,
        flip: equipped.flip ?? false,
        size: 256,
      });
      return av.toDataUri();
    } catch (e) {
      console.warn("avatar render failed", e);
      return "";
    }
  }, [equipped.style, equipped.seed, equipped.backgroundColor?.join(","), equipped.flip, equipped.radius]);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-border ${className}`}
      style={{ width: size, height: size, background: "var(--surface-2)" }}
    >
      {dataUri && (
        <img
          src={dataUri}
          alt="User avatar"
          width={size}
          height={size}
          className="h-full w-full object-cover"
          draggable={false}
        />
      )}
    </div>
  );
}
