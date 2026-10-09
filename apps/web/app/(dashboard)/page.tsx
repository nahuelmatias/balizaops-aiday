import Link from "next/link";
import { Siren, Unplug } from "lucide-react";
import { AssetCard } from "@/components/asset-card";
import { GlobalStatus } from "@/components/global-status";
import { PLANNED_ASSETS } from "@/lib/assets";
import { assetStatus, countByLevel, worstLevel } from "@/lib/status-engine";

export default function DashboardPage() {
  // M1: todavía no hay lecturas; sin Supabase, cada asset arranca sin última lectura.
  const rows = PLANNED_ASSETS.map((asset) => ({
    asset,
    status: assetStatus(null, asset.heartbeat_interval_s),
  }));
  const levels = rows.map((r) => r.status.level);
  const hasData = rows.some((r) => r.status.reason !== "never");

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-md">
            <Siren aria-hidden className="size-5 text-violet-bright" strokeWidth={1.75} />
            <span className="font-display text-lg font-bold tracking-tight text-fg">Baliza</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center lg:gap-12">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-gradient-hero sm:text-5xl">
              Salud de tus assets
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-secondary sm:text-lg">
              Cada agente manda señales de vida; la baliza se prende cuando algo anda mal.
            </p>
            {!hasData && (
              <p className="mt-6 flex max-w-xl items-start gap-3 text-sm leading-relaxed text-fg-secondary">
                <Unplug aria-hidden className="mt-0.5 size-4 shrink-0 text-cyan" strokeWidth={1.75} />
                <span>
                  Todavía no hay una fuente de datos conectada. Cada asset queda en{" "}
                  <strong className="font-medium text-fg">sin señal</strong> hasta que su agente
                  mande la primera lectura.
                </span>
              </p>
            )}
          </div>

          <GlobalStatus level={worstLevel(levels)} counts={countByLevel(levels)} total={rows.length} />
        </div>

        <section aria-labelledby="assets-heading" className="mt-16">
          <h2 id="assets-heading" className="font-display text-2xl font-bold tracking-tight text-fg">
            Assets
          </h2>

          {/* auto-fit: con pocos assets las columnas llenan el ancho; con más, se agregan. */}
          <ul className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))] items-start gap-4 sm:gap-5">
            {rows.map(({ asset, status }) => (
              <li key={asset.id}>
                <AssetCard asset={asset} status={status} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
