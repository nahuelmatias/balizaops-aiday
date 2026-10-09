# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Ops de Flock (staff, `is_staff`)**: revisan a diario, en escritorio, la salud de
  las soluciones entregadas a todos los clientes. Necesitan ver de un vistazo qué
  está mal y dónde.
- **Cliente de Flock (`admin` | `viewer`)**: entra a ver solo los assets de su
  organización, típicamente cuando algo falla. `admin` además da de alta assets,
  define checks/umbrales y carga runbooks.

## Product Purpose

Baliza es el panel de salud de las soluciones que Flock entrega a sus clientes.
Cada agente instalado en planta manda señales de vida; la baliza se prende cuando
algo anda mal. Observa (estado real de dispositivos/servicios por cliente),
detecta (anomalías, caídas, dispositivos que no responden) y orienta (diagnóstico
con RAG sobre runbooks y post-mortems reales, con acción sugerida y citada).

Éxito: que un problema real (ej. cámaras de Scalter caídas por PoE trabado) se vea
en el panel antes de que el cliente lo reporte, y venga con un diagnóstico
trazable a su runbook.

## Positioning

El estado mostrado es siempre real: los agentes empujan lecturas (modelo PUSH) y el
silencio se trata como falla (dead-man switch). Si no hay dato, el panel dice
"sin señal"; nunca inventa. Los diagnósticos citan la parte del runbook de la que
sale cada acción.

## Operating Context

- Nace del incidente real de Scalter (PC de visión, cámaras caídas por PoE
  trabado); runbook en `runbooks/scalter/RUNBOOK.md`.
- Assets del MVP: Scalter (cámaras, carrier/PoE, contenedores, disco, GPU) y una
  Raspberry Pi con un dispositivo USB (presente / desconectado).
- Se presenta en el AI Day de Flock; convive con la plataforma del AI Day.
- Cantidad de assets por organización a mediano plazo: sin definir (hoy 2).

## Capabilities and Constraints

- Multi-tenant: cada usuario ve solo assets de su organización (RLS por `org_id`).
- Niveles: `ok`, `warn`, `crit`, `unknown`. Estado de asset = última lectura,
  salvo stale (sin heartbeat > 2× intervalo) → `crit` "sin señal". Un asset que
  nunca reportó es `unknown` (gris); uno que dejó de reportar es `crit` (rojo).
- Agregado org/global = el peor de sus assets.
- Anti-scope MVP: reparación automática, gráficos de tendencia.
- Terminología: asset, check, lectura (reading), heartbeat, sin señal, runbook,
  diagnóstico.

## Brand Commitments

- Nombre: **Baliza** (balizaops.com.ar). Idioma de la interfaz: español rioplatense.
- Debe verse como parte de la plataforma del AI Day de Flock
  (`ai-day-flockit.vercel.app`); tokens y clases fijados en AGENTS.md §9.
- Tipografía elegida por el usuario: Space Grotesk (display) + Geist (cuerpo).

## Evidence on Hand

- Runbook real de Scalter: `runbooks/scalter/RUNBOOK.md`.
- No hay todavía lecturas, clientes, métricas ni capturas reales. Nada de eso se
  simula: sin dato se muestra "sin señal".

## Product Principles

1. Honestidad de estado por encima de todo: sin dato, "sin señal"; nunca relleno.
2. Lo grave primero: el peor estado manda en cada agregado.
3. Cada recomendación es trazable a su fuente.
4. Lectura operativa y presencia visual del AI Day pesan por igual.
