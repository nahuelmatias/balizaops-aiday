import type { Asset } from "@baliza/shared";

/**
 * Assets planificados del MVP (AGENTS.md §1), declarados a mano mientras no hay
 * Supabase. Es solo su configuración: no hay lecturas, así que el panel los
 * muestra "sin señal". En M1 esto se reemplaza por la query a `assets`.
 */
export const PLANNED_ASSETS: Asset[] = [
  {
    id: "scalter",
    name: "Scalter",
    type: "scalter",
    heartbeat_interval_s: 300,
    config: {
      checks: [
        { id: "frames", type: "advancing", metric: "frame_counter", label: "Cámaras capturando" },
        { id: "carrier", type: "presence", label: "PoE/link" },
        { id: "containers", type: "presence", label: "Contenedores" },
        { id: "disk", type: "threshold", metric: "disk_pct", warn: 85, crit: 95, label: "Disco /" },
        { id: "gpu", type: "presence", label: "GPU" },
      ],
    },
  },
  {
    id: "raspberry-usb",
    name: "Raspberry Pi · USB",
    type: "raspberry",
    heartbeat_interval_s: 300,
    config: {
      checks: [{ id: "usb", type: "presence", label: "Dispositivo USB" }],
    },
  },
];
