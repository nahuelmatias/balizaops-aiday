# AGENTS.md — Baliza (balizaops.com.ar)

> **Baliza** — panel de salud de las soluciones que Flock entrega a sus clientes.
> Cada agente manda señales de vida; la baliza se prende cuando algo anda mal.
> Observa (recibe el estado real de dispositivos/servicios por cliente), detecta
> (anomalías, caídas, dispositivos que no responden) y orienta (diagnóstico con
> RAG sobre runbooks/post-mortems reales + acción sugerida). Nace del incidente
> real de Scalter (cámaras caídas por PoE trabado) — ver `runbooks/scalter/`.

Este archivo es la fuente de verdad para iterar con Claude Code. Leelo antes de
cada tanda de cambios. Si una decisión cambia, actualizá este archivo en el mismo
commit. (Hay un `CLAUDE.md` en la raíz que importa este archivo con `@AGENTS.md`.)

---

## 1. Qué construimos (MVP) y qué NO

**MVP (lo que entra al challenge):**
- Multi-tenant con login. Cada usuario pertenece a una organización (cliente de
  Flock) y solo ve sus assets.
- Dashboard con **semáforo** por asset y un agregado global (verde/amarillo/rojo).
- Dos assets reales conectados:
  1. **Scalter** (PC de visión): empuja salud (cámaras grabando, carrier/PoE,
     contenedores, disco, GPU) reusando la lógica de `scalter-monitor`.
  2. **Raspberry Pi** con un dispositivo USB: empuja si el USB está presente;
     CRIT si se desconectó.
- El usuario puede **dar de alta assets** y **definir qué se monitorea y con qué
  umbrales** (config por asset).
- Por cada asset, una **base de conocimiento / runbook**. Scalter usa el runbook
  real; la Raspberry, uno escrito a mano.
- **Pipeline de diagnóstico RAG** con manejo de fallos por paso y **log trazable**
  de cada diagnóstico (qué se recuperó, qué respondió el LLM, qué acción sugirió).

**Anti-scope (NO en el MVP, dejar como roadmap):**
- Reparación automática/semi-automática (dejar el enganche y el modelo de datos
  preparado; ejecución real = fase futura, con aprobación humana).
- Gráficos de tendencia tipo Grafana (guardamos la serie, pero el MVP muestra
  estado actual + últimas N lecturas).
- **NUNCA datos ni runbooks simulados.** Scalter se conecta de verdad (agente, vía
  Tailscale/red). Si falta un dato real, se muestra **"sin señal"**, no se inventa.
  Construir primero el dashboard capaz de mostrar "sin señal" y recién prender los
  colores cuando entren lecturas reales.

---

## 2. Stack y decisiones (con el porqué)

- **Monorepo** con pnpm workspaces. Todo en un repo.
- **Front:** Next.js (App Router, TypeScript) en **Vercel**. Tailwind. Íconos
  **lucide-react**. Tema visual: ver sección 9.
- **Datos + Auth + Vector:** **Supabase** (Postgres + Auth + pgvector + RLS). Free
  tier que resuelve hosting del back, el realm de auth multi-tenant, el vector
  store del RAG y el aislamiento por cliente, todo junto.
- **Lógica de backend:** Route Handlers de Next (`app/api/*`) para lo que consume
  el front, y **Supabase Edge Functions** / cron para tareas programadas
  (detección de "sin señal"/stale). Preferir Route Handlers salvo que se necesite
  cron server-side.
- **Modelo de recolección: PUSH.** Los agentes empujan estado a `POST /api/ingest`.
  El back nunca inicia conexión hacia la planta (más seguro); el silencio (sin
  heartbeat en N min) se evalúa como CRIT (dead-man switch). Reusa la lógica de
  `scalter-monitor`.
- **LLM / embeddings:** proveedor configurable por env. Default: embeddings
  `text-embedding-3-small` (OpenAI) y diagnóstico con Claude (Anthropic). Abstraer
  detrás de una interfaz `llm`.
- **Lenguaje:** TypeScript en todo el repo. Si una tarea de RAG conviene en Python,
  se aísla como función aparte; por defecto, TS.

---

## 3. Layout del monorepo

```
/
├── AGENTS.md                      # este archivo (fuente de verdad)
├── CLAUDE.md                      # solo importa @AGENTS.md
├── package.json / pnpm-workspace.yaml
├── apps/
│   └── web/                      # Next.js (front + API routes)
│       ├── app/ (auth)/ (dashboard)/ api/{ingest,assets,diagnose}/
│       ├── components/
│       ├── lib/                  # supabase, llm, rag, status-engine
│       └── styles/
├── packages/shared/              # tipos TS compartidos (Asset, Check, Status…)
├── agents/
│   ├── scalter/                  # empuja salud de Scalter
│   └── raspberry-usb/            # empuja presencia del USB
├── runbooks/
│   ├── scalter/RUNBOOK.md        # el runbook REAL (copiar el existente)
│   └── raspberry/RUNBOOK.md      # escrito a mano
└── supabase/
    ├── migrations/               # esquema SQL + RLS + pgvector
    └── functions/                # Edge Functions (stale-check cron, etc.)
```

---

## 4. Modelo de datos (Supabase/Postgres + RLS)

Todas con `org_id` y RLS (un usuario solo ve filas de su org):
- `orgs` — id, name.
- `profiles` — id (= auth.user), org_id, role (`admin`|`viewer`), is_staff, name, email.
- `assets` — id, org_id, name, type (`scalter`|`raspberry`|`generic`), config
  (jsonb: checks + umbrales), heartbeat_interval_s, created_at.
- `readings` — id, asset_id, ts, level (`ok`|`warn`|`crit`|`unknown`), checks
  (jsonb), raw (jsonb). Estado actual del asset = última reading + regla de stale.
- `runbook_docs` — id, asset_id (o asset_type), source, updated_at.
- `runbook_chunks` — id, doc_id, content, embedding `vector(1536)`, metadata.
- `diagnoses` — id, asset_id, trigger_reading_id, created_at, query, retrieved
  (jsonb: chunks citados), llm_output (jsonb: {probable_cause, confidence,
  actions[], cites[]}), status (`ok`|`degraded`|`failed`), latency_ms. **Log
  trazable: cada diagnóstico queda auditado de punta a punta.**

RLS por `org_id = (select org_id from profiles where id = auth.uid())`. El ingest
NO usa sesión de usuario: valida por **API key del asset** (server-side con la
**secret key**), nunca expone la secret al cliente. `is_staff` (Flock interno)
puede ver todo con una policy aparte.

---

## 5. Contrato de ingest (agente → backend)

`POST /api/ingest` · Header `Authorization: Bearer <ASSET_API_KEY>`
```json
{
  "asset_id": "uuid",
  "ts": "2026-10-09T18:00:00Z",
  "level": "ok|warn|crit",
  "checks": [
    {"id": "frames", "label": "Cámaras capturando", "level": "ok", "value": 17140},
    {"id": "carrier", "label": "PoE/link", "level": "ok"},
    {"id": "disk", "label": "Disco /", "level": "warn", "value": 86, "detail": "86%"}
  ],
  "metrics": { "frame_counter": 17140, "dropped_frames": 0, "disk_pct": 86 }
}
```
El back valida (zod) → guarda `reading` → recalcula estado → si `warn|crit` y
cambió respecto del estado previo, dispara diagnóstico (sección 7).

**Agentes del MVP** (livianos, cron en el dispositivo):
- `agents/scalter/`: reusa `scalter-monitor` (lee `/api/v1/health` y
  `/cameras/status`, carrier, disco, GPU), arma el payload y lo postea. Cada 5 min.
- `agents/raspberry-usb/`: chequea el USB (`lsusb` por `VENDOR:PRODUCT`, o un path
  en `/dev`), arma `checks:[{id:"usb", level: present?ok:crit}]`, postea. Cada 1–5 min.
- Config del agente en un `.conf` 600: `ASSET_ID`, `ASSET_API_KEY`, `INGEST_URL`.

---

## 6. Motor de estado y semáforo

- Estado del asset = nivel de su última reading, salvo **stale** (sin heartbeat >
  `heartbeat_interval_s * 2`) → `crit` "sin señal" (dead-man). Un cron marca stale.
- Agregación org/global = el peor de sus assets (crit > warn > ok; unknown = gris).
- Semáforo: **verde=ok**, **amarillo=warn** (ej. disco llenándose), **rojo=crit**
  (caído o sin señal). Chips: `chip-emerald` / `chip-amber` / `chip-rose`.

---

## 7. Pipeline de diagnóstico RAG (manejo de fallos por paso)

Se dispara al pasar a `warn|crit`. Cada paso loguea en `diagnoses` (trazable); si
un paso falla, se degrada con fallback y NO corta la cadena.
1. **Query** desde los checks en falla (ej. "carrier=0 PoE", "frames congelados").
2. **Recuperar** (pgvector top-k sobre `runbook_chunks` del asset/tipo). *Fallo*:
   sin runbook/vacío → `degraded`, seguir con "no hay runbook; síntomas crudos: …".
3. **LLM** con síntomas + chunks → salida **estructurada** validada con zod:
   `{probable_cause, confidence, actions[], cites[]}`. *Fallo* (timeout/parse) →
   `degraded`, devolver la sección de runbook más relevante + "diagnóstico no
   disponible".
4. **Persistir** el diagnosis completo (query, retrieved, llm_output, latencia, status).

Regla de oro: cada acción **cita** de qué parte del runbook salió (trazabilidad);
nunca inventa pasos sin respaldo en el contexto recuperado. Si no sabe, lo dice.
Roadmap: cada `action` puede llevar `command` + `requires_approval` para la futura
reparación semi-automática (dejar el modelo listo, sin ejecutar nada aún).

---

## 8. Multi-tenant y auth

- Supabase Auth (email/password o magic link). Al alta/invitación, el usuario
  queda ligado a una `org` vía `profiles.org_id`.
- Roles: `admin` (alta de assets, config, runbooks) y `viewer`. `is_staff` para
  Flock (ve todo).
- RLS en todas las tablas por `org_id`. Un cliente jamás ve assets de otro.

---

## 9. Design system (tema del AI Day + skill Impeccable)

El front debe verse como la plataforma del AI Day (`ai-day-flockit.vercel.app`):
dark, glassmorphism, acentos violeta/magenta/cyan, limpio y aireado.

**Usar la design skill "Impeccable"** (open-source, `impeccable.style`) con Claude
Code para que la UI no tenga el look genérico de IA y quede pulida. El tema del AI
Day manda; Impeccable es la guía de calidad visual.

Tokens CSS en `:root` (nombres exactos para que calce con el AI Day):
- `--bg-deep` (~`#0a0a24`) con 2–3 "blobs" radiales violeta/magenta/cyan muy
  desenfocados (`blur-[100px]`, baja opacidad) fijos detrás del contenido.
- Acentos: `--accent-violet-bright`, `--accent-violet`, `--accent-magenta`, `--accent-cyan`.
- Texto: `--text-primary`, `--text-secondary`, `--text-muted`. Bordes: `--border-soft`.
- Clases: `glass-panel`, `glass-panel-raised` (translúcido + blur + `rounded-2xl/3xl`),
  `chip` y `chip-violet` / `chip-emerald` / `chip-amber`, y agregar `chip-rose` (crítico).
- Tipografía: `font-display` = **Space Grotesk**, cuerpo = **Geist**, valores
  numéricos en Geist Mono tabular. Títulos `font-bold tracking-tight` (Space
  Grotesk llega a 700; `extrabold` no aplica). H1 con `text-gradient-hero`.
  Íconos lucide (trazos finos). Mobile-first, sin scroll horizontal.
- Semáforo: componente `Beacon` (baliza de 3 lámparas). `unknown` = las tres
  apagadas con carcasa punteada (gris, nunca reportó); stale = lámpara roja.
- Contexto de producto para Impeccable en `apps/web/PRODUCT.md`; brief del
  dashboard en `apps/web/.impeccable/surfaces/`.

---

## 10. Config: qué monitorear y con qué criterios

`assets.config` (jsonb), editable desde la UI:
```json
{
  "checks": [
    {"id": "disk", "type": "threshold", "metric": "disk_pct", "warn": 85, "crit": 95, "label": "Disco /"},
    {"id": "frames", "type": "advancing", "metric": "frame_counter", "label": "Cámaras capturando"},
    {"id": "usb", "type": "presence", "target": "1a86:7523", "label": "Dispositivo USB"}
  ],
  "heartbeat_interval_s": 300
}
```
Tipos del MVP: `threshold`, `advancing` (debe subir entre lecturas), `presence`,
`heartbeat` (implícito). Pensado para sumar tipos sin romper el esquema.

---

## 11. Variables de entorno (nunca commitear secretos)

Supabase migró a claves **publishable** y **secret** (reemplazan anon/service_role,
retiro previsto fin de 2026). Usar las nuevas:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=    # cliente (browser), reemplaza anon
SUPABASE_SECRET_KEY=                     # solo server-side (ingest, RAG), reemplaza service_role
LLM_PROVIDER=anthropic                   # o openai
ANTHROPIC_API_KEY=
OPENAI_API_KEY=                          # embeddings
EMBEDDING_MODEL=text-embedding-3-small
```
Agentes: `ASSET_ID`, `ASSET_API_KEY`, `INGEST_URL` en `.conf` 600 (como
`scalter-monitor.conf`). Las API keys de asset se guardan **hasheadas** en la DB.
**Cuentas a nombre de Flock** (GitHub, Vercel, Supabase, API keys) administrables
por la empresa, no solo personales.

---

## 12. Cómo trabajar en este repo (para Claude Code)

- Releé las secciones relevantes antes de codear. Cambios chicos y verificables.
  TypeScript estricto. **Zod** para validar todo input externo (ingest, config,
  salida del LLM).
- Commits en español, imperativo, acotados (ej. `ingest: validar payload y guardar
  reading`). No commitear secretos ni `.env`.
- Tests mínimos de lo crítico: motor de estado (ok/warn/crit/stale), evaluación de
  checks, parseo de la salida del LLM.
- No introducir datos simulados (ver anti-scope). Para dev, el agente de Scalter
  apunta al backend real por Tailscale.
- Seguridad: la secret key jamás llega al browser; el ingest valida API key; no
  exponer endpoints internos sin auth.
- Toda feature que cambie una decisión de arquitectura actualiza este AGENTS.md en
  el mismo PR.

---

## 13. Milestones

- **M1 – Esqueleto**: monorepo, Next en Vercel (URL `*.vercel.app` primero; el
  dominio `balizaops.com.ar` se conecta cuando haya dashboard desplegado),
  Supabase con auth + tablas + RLS, login y dashboard con semáforo que muestra
  "sin señal".
- **M2 – Ingest real**: endpoint + agente de Scalter empujando de verdad. Semáforo
  real. Dead-man/stale andando.
- **M3 – Segundo asset**: agente Raspberry (USB) + alta de assets y edición de
  checks desde la UI.
- **M4 – RAG**: runbooks de Scalter y Raspberry → embeddings a pgvector → pipeline
  de diagnóstico con fallos manejados y log trazable.
- **M5 – Pulido**: detalle de asset con histórico corto + diagnósticos citados,
  responsive, demo lista.
- **Futuro**: alertas (Telegram), tendencias, reparación semi-automática con aprobación.

---

## 14. Referencias
- Runbook real de Scalter: `runbooks/scalter/RUNBOOK.md` (incidente de PoE).
- Lógica de salud de Scalter: basar el agente en `scalter-monitor` / `scalter-diag`.
- Tema visual: plataforma AI Day de Flock + design skill Impeccable (`impeccable.style`).