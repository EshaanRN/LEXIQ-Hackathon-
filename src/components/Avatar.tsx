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

export function Avatar({ equipped, size = 96, className = "" }: Props) {
  const dataUri = useMemo(() => {
    const style = STYLE_MAP[equipped.style as string] ?? styles.adventurer;
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
          alt="avatar"
          width={size}
          height={size}
          className="h-full w-full object-cover"
          draggable={false}
        />
      )}
    </div>
  );
}
