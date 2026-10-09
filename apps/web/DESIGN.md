---
name: Baliza
description: Panel de salud de las soluciones que Flock entrega a sus clientes, en la noche del AI Day.
colors:
  bg-deep: "#0a0a24"
  accent-violet-bright: "#a78bfa"
  accent-violet: "#7c3aed"
  accent-magenta: "#d946ef"
  accent-cyan: "#22d3ee"
  text-primary: "#f4f3ff"
  text-secondary: "#bdbadb"
  text-muted: "#8e8bb3"
  border-soft: "rgb(167 139 250 / 0.14)"
  border-strong: "rgb(167 139 250 / 0.26)"
  state-ok: "#34d399"
  state-warn: "#fbbf24"
  state-crit: "#fb7185"
  state-unknown: "#8e8bb3"
  state-ok-ink: "#6ee7b7"
  state-warn-ink: "#fcd34d"
  state-crit-ink: "#fda4af"
  beacon-housing: "#16153a"
  lamp-off: "#2c2b52"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  lead:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
  numeric:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"tnum\""
rounded:
  focus: "6px"
  panel: "16px"
  panel-raised: "24px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "20px"
  lg: "24px"
  xl: "32px"
  section: "64px"
components:
  glass-panel:
    backgroundColor: "rgb(255 255 255 / 0.04)"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
    padding: "20px"
  glass-panel-raised:
    backgroundColor: "rgb(255 255 255 / 0.06)"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel-raised}"
    padding: "32px"
  chip:
    backgroundColor: "rgb(255 255 255 / 0.04)"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  chip-emerald:
    backgroundColor: "rgb(52 211 153 / 0.12)"
    textColor: "{colors.state-ok-ink}"
    rounded: "{rounded.pill}"
  chip-amber:
    backgroundColor: "rgb(251 191 36 / 0.12)"
    textColor: "{colors.state-warn-ink}"
    rounded: "{rounded.pill}"
  chip-rose:
    backgroundColor: "rgb(251 113 133 / 0.13)"
    textColor: "{colors.state-crit-ink}"
    rounded: "{rounded.pill}"
  chip-muted:
    backgroundColor: "rgb(142 139 179 / 0.1)"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
  beacon:
    backgroundColor: "{colors.beacon-housing}"
    rounded: "{rounded.pill}"
    padding: "9px"
  beacon-lamp-off:
    backgroundColor: "{colors.lamp-off}"
    rounded: "{rounded.pill}"
    size: "20px"
---

# Design System: Baliza

## Overview

**Creative North Star: "La baliza en la noche del AI Day"**

Baliza vive dentro del mundo visual de la plataforma del AI Day de Flock: un azul-noche profundo, tres blobs de color muy desenfocados fijos detrás del contenido, y paneles de vidrio translúcido con borde finísimo que flotan sobre esa luz. Sobre esa noche, el único objeto con peso físico es la baliza: una carcasa en cápsula con tres lámparas (crítico arriba, advertencia en el medio, OK abajo). El estado se lee por cuál lámpara está encendida, no por números grandes.

La densidad es aireada pero operativa: titulares en Space Grotesk con tracking cerrado, UI en Geist, valores en Geist Mono tabular. El color de marca (violeta, magenta, cyan) pertenece a la atmósfera, la marca y el foco; los colores de semáforo (emerald, amber, rose) aparecen solo donde significan un nivel. "Sin señal" (nunca reportó) es gris-azulado y apagado, nunca un color de alerta.

El sistema rechaza el dashboard de KPIs grandes con sparkline y la grilla de tarjetas-métrica: cada asset es una baliza con su lista de checks.

**Key Characteristics:**
- Fondo noche (`bg-deep`) con blobs violeta/magenta/cyan a `blur(100px)` y baja opacidad, fijos.
- Paneles glass translúcidos con `backdrop-filter` y borde violeta al 14–26%.
- La baliza de tres lámparas como firma: apagada = vidrio gris-azulado; encendida = color de nivel con halo.
- Semáforo semántico estricto; gris para lo que nunca reportó.
- Números siempre en mono tabular.

## Colors

Una noche violeta-azulada con acentos saturados de marca y un semáforo reservado para el estado.

### Primary
- **Violeta Lavanda** (accent-violet-bright): ícono de marca, anillo de foco, segundo tramo del gradiente del H1. Es el violeta que se lee sobre la noche.
- **Violeta Eléctrico** (accent-violet): blob principal del fondo (opacidad 0.30) y color de selección de texto. No se usa como texto.

### Secondary
- **Magenta AI Day** (accent-magenta): solo atmósfera: blob derecho (opacidad 0.16) y tercer tramo del gradiente del H1.

### Tertiary
- **Cyan Señal** (accent-cyan): el acento de datos e información; ícono del aviso "sin fuente conectada", blob inferior (opacidad 0.12) y final del gradiente del H1.

### Neutral
- **Noche Profunda** (bg-deep): fondo de `html` y `body`, siempre detrás de los blobs.
- **Blanco Lila** (text-primary): títulos, nombres de checks, conteos.
- **Lila Gris** (text-secondary): bajadas, leyendas, texto de chips neutros.
- **Lila Apagado** (text-muted): metadatos, criterios de checks, valores vacíos "—", pie de heartbeat.
- **Borde Suave / Borde Fuerte** (border-soft / border-strong): bordes de paneles, divisores de listas, línea bajo la barra superior. El fuerte solo en el panel elevado.
- **Carcasa de Baliza / Lámpara Apagada** (beacon-housing / lamp-off): el vidrio oscuro de la baliza y de sus lámparas apagadas.

### Semáforo
- **Esmeralda** (state-ok, tinta state-ok-ink): nivel OK.
- **Ámbar** (state-warn, tinta state-warn-ink): advertencia (ej. disco llenándose).
- **Rosa Alerta** (state-crit, tinta state-crit-ink): crítico, incluido "sin señal" por stale.
- **Gris Sin Señal** (state-unknown): nunca reportó.

### Named Rules
**The Semáforo Solo Significa Rule.** Emerald, amber y rose aparecen únicamente para expresar un nivel (lámpara, chip, punto de leyenda). Nunca como decoración ni como acento de marca.

**The Gris No Alarma Rule.** Un asset que nunca reportó es gris (`state-unknown`, `chip-muted`, carcasa punteada). Uno que dejó de reportar es rojo. No se mezclan.

**The Marca Es Atmósfera Rule.** Violeta, magenta y cyan viven en el fondo, el gradiente del H1, el foco y los íconos de marca/datos; los paneles y el texto de UI quedan en neutros lila.

## Typography

**Display Font:** Space Grotesk (con system-ui)
**Body Font:** Geist (con system-ui)
**Label/Mono Font:** Geist Mono, con cifras tabulares

**Character:** Space Grotesk aporta el filo técnico del AI Day en titulares cortos y compactos; Geist sostiene la UI con neutralidad; Geist Mono alinea cada número en columna.

### Hierarchy
- **Display** (700, 2.25rem → 3rem desde `sm`, tracking -0.025em): H1 de página, siempre con el gradiente hero (blanco lila → violeta lavanda → magenta → cyan).
- **Veredicto** (700, 1.875rem → 2.25rem, Space Grotesk): el nivel global junto a la baliza grande.
- **Headline** (700, 1.5rem): títulos de sección ("Assets").
- **Title** (700, 1.25rem): nombre de asset en su panel.
- **Lead** (400, 1rem → 1.125rem, line-height 1.625, máx. ~36rem): bajada del H1.
- **Body** (400, 0.875rem): texto de UI, nombres de checks, leyenda.
- **Label** (500, 0.75rem, en minúscula de oración): encabezados de bloque dentro de paneles ("Qué se monitorea"), chips, pies.
- **Numeric** (Geist Mono 400, 0.875rem, `tabular-nums`): conteos y valores de checks.

### Named Rules
**The Número En Mono Rule.** Todo valor medido o conteo va en Geist Mono tabular; el texto que lo rodea, en Geist.

**The Titular Bold Rule.** Los titulares usan Space Grotesk 700 con tracking -0.025em y `text-wrap: balance`.

## Layout

Contenedor centrado de 72rem (`max-w-6xl`) con 16px de margen lateral en mobile y 24px desde `sm`. Barra superior de 64px de alto con borde inferior suave. El hero es una grilla de una columna que en `lg` pasa a dos (`1fr` + hasta 28rem), con 48px de separación: texto a la izquierda, panel de estado global a la derecha. La sección de assets arranca 64px más abajo y usa una grilla auto-fit con columnas de mínimo 22rem (o el 100% en pantallas angostas), gap 16px → 20px, alineada arriba para que paneles de distinta altura no se estiren. La leyenda del estado global es de una columna y pasa a dos desde 420px. Mobile-first y sin scroll horizontal (`overflow-x: hidden` en body).

## Elevation & Depth

La profundidad viene del vidrio, no de sombras proyectadas: paneles translúcidos (gradiente blanco 2–9%) con `backdrop-filter: blur() saturate()` sobre los blobs, un brillo interno de 1px arriba y una sombra ambiental negra muy difusa con spread negativo. Dos niveles: el panel base para cada asset y el panel elevado (más opaco, más blur, borde fuerte, radio mayor) solo para el veredicto global. La baliza es el único objeto con volumen: sombras internas que la hunden y lámparas encendidas que emiten halo en su propio color.

### Shadow Vocabulary
- **Panel** (`inset 0 1px 0 rgb(255 255 255 / 0.05), 0 18px 40px -24px rgb(0 0 0 / 0.7)`): paneles de asset.
- **Panel elevado** (`inset 0 1px 0 rgb(255 255 255 / 0.08), 0 30px 60px -30px rgb(0 0 0 / 0.75)`): veredicto global.
- **Carcasa de baliza** (`inset 0 1px 0 rgb(255 255 255 / 0.06), inset 0 -6px 12px rgb(0 0 0 / 0.35), 0 10px 24px -14px rgb(0 0 0 / 0.8)`).
- **Halo de lámpara** (`0 0 calc(tamaño * 0.9)` del color de nivel al 70%): lámpara encendida; en crítico pulsa hasta 1.6× al 85%.

### Named Rules
**The Un Solo Elevado Rule.** Por pantalla hay un único panel elevado: el que lleva el veredicto. Todo lo demás es panel base.

## Shapes

Esquinas generosas y suaves: 16px en paneles base, 24px en el elevado, píldora completa en chips, carcasa de baliza y lámparas. Bordes de 1px siempre, en violeta translúcido. Dentro de los paneles, las divisiones son líneas de 1px (`border-soft`), nunca cajas anidadas. La única línea punteada del sistema es la carcasa de una baliza sin señal.

## Components

### Chips
Píldoras pequeñas y tenues que nombran un nivel.
- **Style:** fondo blanco 4%, borde suave, texto lila gris, 0.75rem/500, padding 3px 10px, radio píldora.
- **Variantes de nivel:** `chip-emerald` (OK), `chip-amber` (advertencia), `chip-rose` (crítico y sin señal por stale), `chip-muted` (nunca reportó): fondo del color al 10–13%, borde al 28–36%, tinta clara del mismo tono. `chip-violet` está definido por el tema AI Day para etiquetas de marca no semánticas.

### Cards / Containers
- **Corner Style:** 16px (base), 24px (elevado).
- **Background:** gradiente blanco translúcido a 160° sobre los blobs, con blur 18px (base) o 24px (elevado).
- **Shadow Strategy:** ver Elevation & Depth.
- **Border:** 1px `border-soft` (base) o `border-strong` (elevado).
- **Internal Padding:** 20px → 24px (base); 24px → 32px (elevado).

### Navigation
Barra superior mínima: ícono lucide de sirena en violeta lavanda (trazo 1.75) + "Baliza" en Space Grotesk 700, 1.125rem. Borde inferior suave, sin fondo propio.

### Baliza (componente firma)
Carcasa en cápsula vertical con tres lámparas apiladas: crítico arriba, advertencia, OK abajo. Tres tamaños: chica (lámpara 14px), mediana (20px, en paneles de asset) y grande (40px, en el veredicto global). Apagada, cada lámpara es vidrio gris-azulado con un aro finísimo de su color al 22%; encendida, gradiente radial del color de nivel con halo. En crítico, el halo pulsa cada 1.6s (`cubic-bezier(0.16, 1, 0.3, 1)`) y se detiene con `prefers-reduced-motion`. En "nunca reportó" las tres quedan apagadas y la carcasa pasa a borde punteado. Es decorativa para lectores de pantalla: el nivel siempre va escrito al lado.

### Lista de checks
Dentro del panel de asset, bajo un label "Qué se monitorea": filas separadas por líneas de 1px, nombre del check en texto primario, criterio en muted 0.75rem, valor alineado a la derecha en mono tabular ("—" con texto para lector "sin dato" cuando no hay lectura).

## Do's and Don'ts

### Do:
- **Do** leer el estado por la baliza de tres lámparas y repetirlo en texto (chip + motivo).
- **Do** mostrar "sin señal" en gris apagado con carcasa punteada cuando un asset nunca reportó, y "—" en sus valores.
- **Do** poner todo número en Geist Mono con `tabular-nums`.
- **Do** mantener los nombres de tokens y clases del tema AI Day (`--bg-deep`, `--accent-*`, `--text-*`, `--border-soft`, `glass-panel`, `glass-panel-raised`, `chip-*`, `text-gradient-hero`) sin renombrar.
- **Do** usar íconos lucide de trazo fino (1.5–1.75).
- **Do** respetar `prefers-reduced-motion`: el pulso crítico se apaga.

### Don't:
- **Don't** construir dashboards de KPIs grandes con sparkline ni grillas de tarjetas-métrica; cada asset es una baliza con su lista de checks.
- **Don't** usar emerald, amber o rose fuera de un nivel de estado.
- **Don't** pintar en color de alerta un asset que nunca reportó, ni en gris uno que dejó de reportar.
- **Don't** inventar valores: sin lectura real, el valor es "—".
- **Don't** apilar más de un panel elevado por pantalla.
