# Baliza

**Know when something needs attention.**

Baliza es una plataforma de monitoreo de salud de dispositivos y servicios. Un
solo lugar para saber si todos tus sistemas están bien, entender qué falló y cómo
resolverlo. Cada dispositivo corre un agente liviano que **empuja** su estado;
Baliza lo muestra en un semáforo y, cuando algo se rompe, **diagnostica con IA**
sobre runbooks reales y sugiere la acción a tomar.

Pensada como plataforma genérica: hoy monitorea una PC de visión industrial y una
Raspberry Pi, mañana cualquier cosa (servidores, robots, tótems, servicios web,
IoT). Nada está atado a un dispositivo ni a un cliente puntual.

> **Estado:** MVP para el **AI Day de Flock**. Repositorio del challenge.

---

## Cómo funciona

- **Observa** — cada asset corre un agente que reporta su estado a `POST /api/ingest`
  (modelo push: la plataforma nunca entra a la red del dispositivo).
- **Detecta** — el motor de estado calcula verde / amarillo / rojo por asset y un
  agregado global. Si un agente deja de reportar (silencio), se marca como caído
  (dead-man switch).
- **Orienta** — ante una falla, un pipeline RAG consulta el runbook/base de
  conocimiento del asset y sugiere un diagnóstico y acciones, citando de dónde
  salió cada una. Cada diagnóstico queda registrado y es auditable.

El diagnóstico con IA es **opcional**: el monitoreo y el semáforo funcionan igual
sin claves de LLM.

## Assets del MVP

| Asset | Tipo | Qué monitorea |
|-------|------|----------------|
| Scalter | `scalter` | Cámaras capturando, PoE/link, contenedores, disco, GPU |
| Raspberry Pi | `raspberry` | Presencia de un dispositivo USB (CRIT si se desconecta) |

## Stack

- **Front:** Next.js (App Router, TypeScript) + Tailwind, desplegable en Vercel.
- **Datos / Auth / Vector:** Supabase (Postgres + Auth + pgvector + RLS).
- **Backend:** Route Handlers de Next + Supabase Edge Functions (cron de stale).
- **Agentes:** scripts livianos que corren en cada dispositivo (cron).
- **IA:** embeddings + LLM configurables por env (Claude / OpenAI).
- Monorepo con pnpm workspaces.

## Estructura del repo

```
apps/web/          Next.js (front + API routes)
packages/shared/   Tipos TS compartidos
agents/            Agentes por dispositivo (scalter, raspberry-usb)
runbooks/          Bases de conocimiento por asset (RAG)
supabase/          Migraciones (esquema + RLS + pgvector) y Edge Functions
AGENTS.md          Arquitectura y fuente de verdad del proyecto
```

## Puesta en marcha (desarrollo)

Requisitos: Node LTS (≥ 22) y pnpm.

```bash
pnpm install
pnpm -C apps/web dev      # http://localhost:3000
```

Configuración (crear `apps/web/.env.local`, nunca commitear):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
EMBEDDING_MODEL=text-embedding-3-small
```

> Supabase usa las nuevas claves **publishable** / **secret** (reemplazan
> anon / service_role). La secret key es solo server-side.

## Milestones

1. **M1** — Esqueleto + tema visual + dashboard con semáforo en "sin señal".
2. **M2** — Ingest real + agente de Scalter. Semáforo con datos reales + dead-man.
3. **M3** — Segundo asset (Raspberry/USB) + alta de assets y checks desde la UI.
4. **M4** — RAG: runbooks → pgvector → diagnóstico con citas y log trazable.
5. **M5** — Pulido, detalle de asset, responsive, demo.

Arquitectura, modelo de datos y convenciones: ver [`AGENTS.md`](./AGENTS.md).

## Titularidad

Desarrollado en el marco del AI Day de Flock.
Lo que hay es lo que ves. En mi PC funciona.