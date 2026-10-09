import type { Asset, CheckConfig } from "@baliza/shared";
import { Cctv, Cpu, Server, type LucideIcon } from "lucide-react";
import type { AssetStatus } from "@/lib/status-engine";
import { LEVEL_CHIP, REASON_LABEL, statusLabel } from "@/lib/levels";
import { Beacon } from "./beacon";

const TYPE_META: Record<Asset["type"], { label: string; icon: LucideIcon }> = {
  scalter: { label: "PC de visión", icon: Cctv },
  raspberry: { label: "Raspberry Pi", icon: Cpu },
  generic: { label: "Genérico", icon: Server },
};

/** Criterio del check en palabras, a partir de su config (AGENTS.md §10). */
function criterion(check: CheckConfig): string {
  switch (check.type) {
    case "threshold":
      return `warn ${check.warn}% · crit ${check.crit}%`;
    case "advancing":
      return "debe avanzar";
    case "presence":
      return "presente";
    case "heartbeat":
      return "heartbeat";
  }
}

function formatInterval(seconds: number): string {
  return seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} s`;
}

export function AssetCard({ asset, status }: { asset: Asset; status: AssetStatus }) {
  const meta = TYPE_META[asset.type];
  const Icon = meta.icon;
  const titleId = `asset-${asset.id}`;

  return (
    <article aria-labelledby={titleId} className="glass-panel p-5 sm:p-6">
      <header className="flex items-center gap-5">
        <Beacon level={status.level} size="md" />
        <div className="min-w-0">
          <h3 id={titleId} className="font-display text-xl font-bold tracking-tight text-fg">
            {asset.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
            <Icon aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />
            {meta.label}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span className={`chip ${LEVEL_CHIP[status.level]}`}>
              {statusLabel(status.level, status.reason)}
            </span>
            <span className="text-sm text-pretty text-fg-secondary">
              {REASON_LABEL[status.reason]}
              {status.reason === "never" && " · espera la primera lectura"}
            </span>
          </p>
        </div>
      </header>

      <div className="mt-6 border-t border-line pt-4">
        <h4 className="text-xs font-medium text-fg-muted">Qué se monitorea</h4>
        <ul className="mt-2 divide-y divide-line">
          {asset.config.checks.map((check) => (
            <li key={check.id} className="flex items-baseline justify-between gap-3 py-2">
              <span className="min-w-0">
                <span className="text-sm text-fg">{check.label}</span>
                <span className="ml-2 text-xs text-fg-muted">{criterion(check)}</span>
              </span>
              <span className="font-mono text-sm tabular-nums text-fg-muted">
                <span aria-hidden>—</span>
                <span className="sr-only">sin dato</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="pt-4 text-xs text-fg-muted">
        Heartbeat cada {formatInterval(asset.heartbeat_interval_s)} · sin señal tras{" "}
        {formatInterval(asset.heartbeat_interval_s * 2)}
      </p>
    </article>
  );
}
