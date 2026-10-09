# Runbook — Server de visión Scalter

Guía de resolución de problemas del server de producción (cámaras Basler + YOLO +
stack Docker). Pensada para que **cualquiera del equipo** la lea y resuelva, o al
menos se anime a diagnosticar antes de llamar a Guille.

> ## Filosofía: primero descartá la red, después culpá a la IA
>
> La mayoría de las veces que "las cámaras dejaron de andar" NO es la IA, ni los
> drivers, ni el hardware. Es la red/energía entre la PC y las cámaras. Seguí las
> capas de abajo hacia arriba: energía/cable → placa → IP → cámara → backend →
> frontend. No saltees capas: cambiar drivers cuando era una IP caída o el PoE
> trabado es perder una tarde.

## Herramientas de diagnóstico (instaladas en el server)

Dos scripts, para dos cosas distintas:

**`scalter-diag`** — chequeo rápido: te dice en qué capa está el problema.
```bash
scalter-diag          # OK / AVISO / FALLA por cada capa (red, cámaras, backend, GPU, disco)
scalter-diag --fix    # además levanta la red y reinicia el backend (solo con alguien mirando)
```

**`scalter-report`** — foto completa: junta TODO el estado en un `.txt` para mandar a
diagnosticar (o pegarlo en una consulta). Es solo lectura, no cambia nada.
```bash
sudo scalter-report   # deja un scalter-report-FECHA.txt y te dice la ruta
```
Cuando algo falla y no sabés por dónde empezar, corré `scalter-report` y pasá el
archivo: trae kernel, holds, GPU, placas (ethtool/carrier/SR-IOV), dmesg de igb,
Tailscale, contenedores, health/enumerate/status de las cámaras y los últimos
eventos de red y comandos sudo.

Instalación de ambos (si no estuvieran):
```bash
sudo install -m 755 scalter-diag.sh   /usr/local/bin/scalter-diag
sudo install -m 755 scalter-report.sh /usr/local/bin/scalter-report
```

## Datos del equipo (para tener a mano)

| Qué | Valor |
|-----|-------|
| Placa de red | Basler GigE 2-port **PoE** (sobre chip Intel I350; en Linux aparece como "Intel I350" con driver `igb`). MAC OUI `00:30:53` = Basler. |
| Placa cámara 1 | `enp2s0f0` → perfil `00-30-53-FE-38-76` → IP fija `192.168.3.2/24` |
| Placa cámara 2 | `enp2s0f1` → perfil `00-30-53-FE-38-77` → IP fija `192.168.5.2/24` |
| Cámara 1 | `192.168.3.3` (Basler a2A2600-20gcBAS) |
| Cámara 2 | `192.168.5.3` (Basler a2A2600-20gcBAS) |
| Contenedores | frontend / backend / n8n / mongodb / minio (todos `scalter-*-prod`) |
| Frontend | nginx en `http://localhost:5173` |
| Backend/API | uvicorn en `http://localhost:8000/api/v1` |
| Acceso remoto | Tailscale, hostname `scalter-vision`, IP `100.94.235.75` (tailnet de Flock) |

---

# Problemas por síntoma

## 1. Las DOS placas sin link al mismo tiempo → PoE trabado (lo más grave)

**Cómo se ve:** las dos bocas de cámara caen juntas. `nmcli` las muestra "no
disponible", `ethtool` da `Link detected: no` / `Speed: Unknown` en ambas, y
`cat /sys/class/net/enp2s0f0/carrier` da `0`. Las cámaras no pinguean.

**Causa:** la placa Basler alimenta las cámaras por **PoE**. Ese circuito tiene una
protección que se **traba** ante un pico, un corto o un transitorio (por ejemplo,
después de recargar el driver o toquetear la red) y corta la energía a las dos
cámaras. El chip de datos (I350/igb) sigue perfecto, pero sin PoE las cámaras no
encienden → sin link.

**Por qué un `reboot` NO lo arregla:** un reinicio mantiene la fuente de la PC
energizada, así que el circuito PoE no se resetea. Lo confirmamos: reiniciamos y
las placas volvieron con los nombres correctos pero seguían sin link.

**Cómo arreglarlo (lo que funcionó):**
1. **Apagar la PC por completo** (`sudo poweroff`, o el botón).
2. **Desenchufarla de la corriente ~30 segundos.** Esto es lo clave: destraba el
   latch del PoE.
3. Volver a enchufar y encender.

> OJO remoto: si hacés `poweroff` por SSH no la podés volver a prender sola —
> alguien tiene que apretar el botón. Aprovechá esa visita para revisar también
> que el conector de alimentación auxiliar de la placa Basler esté firme y los
> LEDs de placa/cámaras. (Pendiente de infra: Wake-on-LAN o zapatilla inteligente
> para poder cortar/dar energía remoto y no depender del botón.)

Al volver, las placas levantan solas con IP. Confirmar:
```bash
for i in enp2s0f0 enp2s0f1; do echo -n "$i carrier: "; cat /sys/class/net/$i/carrier; done   # deben dar 1
ping -c2 192.168.3.3 && ping -c2 192.168.5.3
docker restart scalter-backend-prod
docker logs scalter-backend-prod 2>&1 | grep -iE "basler|camara|exitosa" | tail
```

---

## 2. Cámaras sin IP / backend dice "No se encontraron cámaras Basler"

Las placas tienen enlace (`UP`) pero no tienen IP. "UP" no es tener IP.

**Confirmar:**
```bash
ip -br addr show enp2s0f0     # ¿sale 192.168.3.2, o está vacío?
ip -br addr show enp2s0f1     # ¿sale 192.168.5.2?
```
**Arreglar:**
```bash
sudo nmcli con up "00-30-53-FE-38-76"
sudo nmcli con up "00-30-53-FE-38-77"
docker restart scalter-backend-prod
```

**Causa conocida (incidente 23/9):** alguien desconectó las placas a mano desde el
menú de red de GNOME (`reason 'user-requested'` en el log de NetworkManager). Una
desconexión manual no se reconecta sola.

---

## 3. Las placas vuelven como `eth0`/`eth1` (tras recargar el driver o un reboot)

**Cómo se ve:** en vez de `enp2s0f0`/`enp2s0f1` aparecen `eth0`/`eth1`, "no
disponibles".

**Causa:** alguien recargó el driver en caliente (`modprobe -r igb && modprobe igb`,
o tocó SR-IOV). Al recargarse en vivo, udev no vuelve a aplicar el renombrado
predecible y quedan como `eth0/eth1`.

**Arreglar:** los perfiles atan por **MAC**, así que no dependen del nombre. Si hay
link, `nmcli con up` de los dos perfiles alcanza. Si encima no hay link, suele ser
el PoE trabado → ver sección 1 (apagado total). Un reinicio restaura los nombres
`enp2s0f0`.

**Evitar la causa:** que ningún script recargue `igb` en caliente. Lo que haya que
setear (jumbo, colas) se hace con `ethtool` sobre la interfaz viva o con opciones
en `/etc/modprobe.d/` que aplican solo al bootear. (El `fix_basler_gige_ubuntu.sh`
del repo NO recarga el driver — toca rp_filter, IP, MTU, firewall; quedó descartado.)

---

## 4. Frontend: "NetworkError when attempting to fetch resource"

1. **Recargá fuerte** (Ctrl+Shift+R) y esperá unos segundos. Suele ser la pestaña
   abierta durante un reinicio del backend.
2. Si sigue:
   ```bash
   curl -s http://localhost:8000/api/v1/health | python3 -m json.tool | head
   # el front debe apuntar a http://localhost:8000:
   docker exec scalter-frontend-prod sh -c 'grep -ohE "https?://[a-zA-Z0-9.:-]+" /usr/share/nginx/html/assets/*.js | sort -u'
   curl -s -D - -o /dev/null -H "Origin: http://localhost:5173" http://localhost:8000/api/v1/health | grep -i access-control
   ```
   - Si apunta a una IP vieja en vez de `localhost:8000` → rebuild del front con la URL correcta.
   - Si no aparece `access-control-allow-origin` → CORS.
   - Un 500 del backend se ve como "NetworkError" en Firefox: `docker logs --since 10m scalter-backend-prod 2>&1 | grep -v /health | tail`.

El puerto 5173 lo sirve el nginx del contenedor `scalter-frontend-prod` (no es un `npm run dev` suelto).

---

## 5. `is_reachable: false` en enumerate pero las cámaras andan

No es error: Pylon lo marca así cuando el backend ya tiene la cámara abierta en modo
exclusivo. Confirmar con `curl .../cameras/basler/0/params` → `"status": "grabbing"`.

---

## 6. Backend no arranca / GPU / disco

- **Backend:** `docker logs scalter-backend-prod | tail -50`. Depende de GPU, disco y mongo/minio.
- **GPU:** `nvidia-smi` debe listar la RTX. Si falla, suele ser desajuste driver-kernel tras un reinicio con kernel nuevo (ver sección de mantenimiento).
- **Disco:** `df -h /` y `docker system df`. Liberar con `docker image prune`. NUNCA borrar los volúmenes `scalter_mongo_data_prod` ni `scalter_minio_data_prod`.

---

# Mantenimiento: kernel, updates y holds

Cada cambio de kernel rompía el módulo NVIDIA y dejaba el server sin GPU. Para
evitarlo, se **congelaron** (hold) kernel + NVIDIA + Docker y se **apagaron** las
actualizaciones automáticas. Esto es lo que se corrió efectivamente:

### Lo que está aplicado hoy

**1. Auto-actualizaciones apagadas** (`/etc/apt/apt.conf.d/20auto-upgrades`):
```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "0";
```
Se aplicó con:
```bash
sudo sed -i 's/Unattended-Upgrade "1"/Unattended-Upgrade "0"/' /etc/apt/apt.conf.d/20auto-upgrades
```

**2. Paquetes congelados** (10 en total). Comando que se corrió:
```bash
# kernel + NVIDIA (van juntos)
sudo apt-mark hold \
  linux-generic-hwe-24.04 \
  linux-image-generic-hwe-24.04 \
  linux-headers-generic-hwe-24.04 \
  linux-modules-nvidia-580-open-generic-hwe-24.04 \
  nvidia-driver-580-open

# Docker (para que no reinicie el daemon y bouncee los contenedores)
sudo apt-mark hold \
  docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
Verificar qué está congelado:
```bash
apt-mark showhold
```

### Cómo SACAR el hold (cuando toque actualizar, en ventana de mantenimiento)

> Hacelo con alguien que pueda llegar físicamente a la PC, por si la red o la GPU
> quedan mal al reiniciar.

```bash
# 1. Liberar kernel + NVIDIA
sudo apt-mark unhold \
  linux-generic-hwe-24.04 \
  linux-image-generic-hwe-24.04 \
  linux-headers-generic-hwe-24.04 \
  linux-modules-nvidia-580-open-generic-hwe-24.04 \
  nvidia-driver-580-open

# 2. Actualizar
sudo apt update && sudo apt upgrade

# 3. CONFIRMAR que el módulo NVIDIA quedó para el kernel nuevo ANTES de reiniciar
dkms status
ls /lib/modules/$(uname -r)/updates/dkms 2>/dev/null

# 4. Recién ahí reiniciar, y después volver a poner el hold (paso 2 de "Lo aplicado")
```
Para liberar Docker, lo mismo con `sudo apt-mark unhold docker-ce docker-ce-cli
containerd.io docker-buildx-plugin docker-compose-plugin`.

> **Regla de oro:** nunca reiniciar con kernel nuevo sin confirmar que el módulo
> NVIDIA está compilado para ese kernel, o el server vuelve sin GPU y el backend no
> arranca.

Para volver a prender las auto-actualizaciones (no recomendado en este server),
poner `Unattended-Upgrade "1"` en el mismo archivo.

---

# Acceso remoto (Tailscale)

El server está en la tailnet de Flock con hostname `scalter-vision`, IP
`100.94.235.75`. Desde una máquina en la misma tailnet:
```bash
ssh usuario@100.94.235.75
```
`tailscaled` y `sshd` arrancan solos al bootear, así que sobreviven a un reinicio.
Lo único que NO se puede hacer remoto es **encender** la PC si está apagada del todo
(ver el pendiente de WoL / zapatilla inteligente en la sección 1).

---

# Apéndice: diagnosticar de cero (si el script no alcanza)

Orden mental, capa por capa:
1. **Energía/PoE:** ¿las dos bocas caídas juntas? → sección 1 (apagado total).
2. **Cable/enlace:** `sudo ethtool enp2s0f0 | grep -i "link detected"` → `yes`.
3. **IP:** `ip -br addr show enp2s0f0` → tiene que tener IP.
4. **Cámara:** `ping 192.168.3.3`.
5. **Backend ve la cámara:** `curl .../cameras/basler/enumerate`.
6. **Backend captura:** `curl .../cameras/basler/0/params` → `grabbing`.
7. **Frontend habla con backend:** consola del navegador + logs de nginx.

Detective:
- `journalctl -u NetworkManager -b | grep enp2s0f0` → historia de la placa.
- `journalctl _COMM=sudo --since today` → qué comandos con sudo se corrieron.
- `sudo dmesg | grep -iE "igb.*link"` → si el driver vio el link al bootear.

---

# Cómo agregar un problema nuevo a este runbook

Cuando resuelvas algo nuevo, sumá una sección con este molde:

```
## N. [Síntoma, como lo vive el usuario]
**Cómo se ve:** ...
**Cómo confirmarlo:** [comandos]
**Cómo arreglarlo:** [comandos]
**Qué NO es:** [para no mandar a nadie por el camino equivocado]
**Por qué pasó:** [causa raíz, si se conoce]
```