import type { CSSProperties } from "react";
import type { Level } from "@baliza/shared";

const LAMPS = [
  { level: "crit", color: "var(--state-crit)" },
  { level: "warn", color: "var(--state-warn)" },
  { level: "ok", color: "var(--state-ok)" },
] as const;

/**
 * Baliza de tres lámparas. Prende la lámpara del nivel; en `unknown` quedan
 * las tres apagadas. Es decorativa para lectores de pantalla: el estado va en
 * texto al lado.
 */
export function Beacon({ level, size = "sm" }: { level: Level; size?: "sm" | "md" | "lg" }) {
  return (
    <span aria-hidden className={`beacon beacon-${size}`} data-level={level}>
      {LAMPS.map((lamp) => (
        <span
          key={lamp.level}
          className="beacon-lamp"
          data-level={lamp.level}
          data-on={lamp.level === level ? "" : undefined}
          style={{ "--lamp": lamp.color } as CSSProperties}
        />
      ))}
    </span>
  );
}
