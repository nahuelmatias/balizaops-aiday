import type { Level } from "@baliza/shared";
import type { StatusReason } from "./status-engine";

/** Clase de chip por nivel (AGENTS.md §6). */
export const LEVEL_CHIP: Record<Level, string> = {
  ok: "chip-emerald",
  warn: "chip-amber",
  crit: "chip-rose",
  unknown: "chip-muted",
};

export const LEVEL_LABEL: Record<Level, string> = {
  ok: "OK",
  warn: "Advertencia",
  crit: "Crítico",
  unknown: "Sin señal",
};

/** Etiqueta del estado de un asset: stale también es "sin señal", pero en rojo. */
export function statusLabel(level: Level, reason: StatusReason): string {
  return reason === "stale" ? "Sin señal" : LEVEL_LABEL[level];
}

export const REASON_LABEL: Record<StatusReason, string> = {
  never: "Nunca reportó",
  stale: "Dejó de reportar",
  reading: "Última lectura",
};
