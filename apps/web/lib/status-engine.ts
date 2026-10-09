import type { Level } from "@baliza/shared";

/** Por qué un asset tiene el nivel que tiene. */
export type StatusReason = "reading" | "stale" | "never";

export interface AssetStatus {
  level: Level;
  reason: StatusReason;
}

/** Orden de severidad para agregar: crit > warn > ok > unknown (AGENTS.md §6). */
const SEVERITY: Record<Level, number> = { unknown: 0, ok: 1, warn: 2, crit: 3 };

/**
 * Estado actual de un asset (AGENTS.md §6).
 * - Nunca reportó → `unknown` (gris, "sin señal").
 * - Sin heartbeat por más de 2× el intervalo → `crit` (rojo, "sin señal", dead-man).
 * - Si no, el nivel de la última lectura.
 */
export function assetStatus(
  lastReading: { ts: string; level: Exclude<Level, "unknown"> } | null,
  heartbeatIntervalS: number,
  now?: Date,
): AssetStatus {
  if (!lastReading) return { level: "unknown", reason: "never" };
  // `now` se resuelve recién acá: sin lectura no hace falta leer el reloj
  // (con cacheComponents, leerlo en render obliga a renderizar dinámico).
  const ageMs = (now ?? new Date()).getTime() - new Date(lastReading.ts).getTime();
  if (ageMs > heartbeatIntervalS * 2 * 1000) return { level: "crit", reason: "stale" };
  return { level: lastReading.level, reason: "reading" };
}

/** Agregado org/global: el peor de sus assets. Sin assets → `unknown`. */
export function worstLevel(levels: Level[]): Level {
  return levels.reduce<Level>(
    (worst, l) => (SEVERITY[l] > SEVERITY[worst] ? l : worst),
    "unknown",
  );
}

/** Conteo por nivel, para la leyenda del agregado. */
export function countByLevel(levels: Level[]): Record<Level, number> {
  const counts: Record<Level, number> = { ok: 0, warn: 0, crit: 0, unknown: 0 };
  for (const l of levels) counts[l]++;
  return counts;
}
