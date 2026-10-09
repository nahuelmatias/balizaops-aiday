/** Nivel de salud de un asset o check (AGENTS.md §4, §6). */
export type Level = "ok" | "warn" | "crit" | "unknown";

export type AssetType = "scalter" | "raspberry" | "generic";

export type CheckType = "threshold" | "advancing" | "presence" | "heartbeat";

/** Definición de un check en `assets.config` (AGENTS.md §10). */
export interface CheckConfig {
  id: string;
  type: CheckType;
  label: string;
  metric?: string;
  warn?: number;
  crit?: number;
  target?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  config: { checks: CheckConfig[] };
  heartbeat_interval_s: number;
}

/** Resultado de un check dentro de una lectura (AGENTS.md §5). */
export interface CheckResult {
  id: string;
  label: string;
  level: Level;
  value?: number | string;
  detail?: string;
}

export interface Reading {
  id: string;
  asset_id: string;
  ts: string;
  level: Exclude<Level, "unknown">;
  checks: CheckResult[];
}
