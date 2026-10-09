import type { Level } from "@baliza/shared";
import { LEVEL_LABEL } from "@/lib/levels";
import { Beacon } from "./beacon";

/**
 * Leyenda única del semáforo. `unknown` cuenta solo los que nunca reportaron:
 * un asset que deja de reportar (stale) cuenta como Crítico.
 */
const LEGEND: { level: Level; label: string; dot: string }[] = [
  { level: "crit", label: "Crítico", dot: "bg-crit" },
  { level: "warn", label: "Advertencia", dot: "bg-warn" },
  { level: "ok", label: "OK", dot: "bg-ok" },
  { level: "unknown", label: "Nunca reportó", dot: "bg-unknown" },
];

/** Agregado global: el peor de los assets, con conteo por nivel. */
export function GlobalStatus({
  level,
  counts,
  total,
}: {
  level: Level;
  counts: Record<Level, number>;
  total: number;
}) {
  return (
    <section
      aria-labelledby="global-status"
      className="glass-panel-raised flex items-center gap-6 p-6 sm:gap-8 sm:p-8"
    >
      <Beacon level={level} size="lg" />
      <div className="min-w-0 flex-1">
        <h2
          id="global-status"
          className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl"
        >
          {LEVEL_LABEL[level]}
        </h2>
        <p className="mt-1 text-sm text-fg-secondary">
          Estado global · {total} {total === 1 ? "asset" : "assets"}
        </p>
        <dl className="mt-5 grid grid-cols-1 gap-y-2 min-[420px]:grid-cols-2 min-[420px]:gap-x-6">
          {LEGEND.map(({ level: l, label, dot }) => (
            <div key={l} className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-sm text-fg-secondary">
                <span aria-hidden className={`size-2 rounded-full ${dot}`} />
                {label}
              </dt>
              <dd className="font-mono text-sm tabular-nums text-fg">{counts[l]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-fg-muted">
          Si un asset deja de reportar, pasa a Crítico como sin señal.
        </p>
      </div>
    </section>
  );
}
