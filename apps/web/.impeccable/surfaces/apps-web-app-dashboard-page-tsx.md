---
version: 1
slug: "apps-web-app-dashboard-page-tsx"
primary_target: "apps/web/app/(dashboard)/page.tsx"
related_targets: ["apps/web/components/asset-card.tsx","apps/web/components/global-status.tsx","apps/web/components/beacon.tsx"]
---

# Dashboard (M1)

Scope: `/` dashboard de assets (`app/(dashboard)/page.tsx`). Mode: Operate. Build path: code-led (Operate; sin generación de imágenes).
Audiencia: ops de Flock (escritorio, diario) y cliente (entra cuando algo falla).
Tarea: saber en segundos qué asset está mal y por qué nivel. M1 sin fuente de datos: todo `unknown` ("sin señal", gris).
Restricciones: tema AI Day fijado (AGENTS.md §9); Space Grotesk + Geist fijados por el usuario; nada simulado.
Abierto: densidad para decenas de assets (hoy 2; diseñar para pocos que escale a compacto).

## Direction contract

THESIS: El panel es una fila de balizas, no una grilla de tarjetas-métrica. Cada asset es una baliza física de tres lámparas; el estado se lee por qué lámpara está encendida. Rechaza el dashboard de KPIs grandes con sparkline.

OWN-WORLD: Noche AI Day: `--bg-deep` #0a0a24 con blobs violeta/magenta/cyan desenfocados; paneles glass de borde fino; acentos violeta para marca/foco, cyan para datos; estados emerald/amber/rose solo donde significan; gris-azulado para "sin señal". Space Grotesk en títulos, Geist en UI, Geist Mono tabular en valores.

STORY: El visitante ve primero el veredicto global (una baliza grande), entiende que no hay datos todavía y por qué (sin fuente conectada), y recorre cada asset con qué se le va a monitorear.

FIRST VIEWPORT: Barra superior con marca Baliza. H1 con gradiente hero + baliza global a la derecha con leyenda de conteos por nivel. Debajo, grilla 1/2/3 columnas de paneles de asset: nombre, tipo, baliza de 3 lámparas apagadas, "nunca reportó", lista de checks configurados con valor "—".

FORM: Brief-pinned (AI Day §9); concept-seed no corrido. Signature move: la baliza de tres lámparas (gris apagada = sin señal; roja con halo = crit/stale).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
