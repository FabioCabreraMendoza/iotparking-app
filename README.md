# IoT Parking — Sistema de Estacionamiento Inteligente (10 cajones)

Monorepo con firmware ESP32, backend (Node/Express/Socket.io), frontend (React/Vite/Tailwind),
migraciones SQL para Supabase/Postgres, Docker y blueprint de Render.

## Estructura

```
/firmware   Firmware C++ para ESP32 (PlatformIO / Arduino IDE)
/backend    API REST + servidor Socket.io (Express, pg, JWT)
/frontend   SPA React (vista Usuario "/" y Administrador "/admin")
/docker     Dockerfiles y docker-compose.yml para desarrollo local
render.yaml Blueprint de despliegue en Render
```

## Arquitectura y flujo de datos

```
ESP32 (firmware) <--Socket.IO--> backend (Express+Socket.io) <--REST/Socket.IO--> frontend (React)
                                        |
                                        v
                                  Postgres (Supabase en prod, contenedor local en dev)
```

- El ESP32 envía `ir_sensor_update`, `rfid_entry_scan`, `rfid_exit_scan` al backend.
- El backend envía al ESP32 `led_state`, `open_barrier`, `lcd_message`.
- El backend envía al frontend `cajones_update`, `new_card_detected`, `historial_update`.
- Toda la lógica de negocio (capacidad máxima, límite de reservas al 50%, expiración de
  reservas, flujo de registro por RFID) vive en `backend/src/services/parkingService.js`.
- El "reloj simulado" (`backend/src/services/systemTimeService.js`) es un offset en memoria
  que el admin puede fijar desde el panel; se usa para las fechas de reservas y del
  historial de accesos, permitiendo generar datos históricos de prueba sin esperar tiempo real.

## Requisitos

- Node.js 20+
- Docker Desktop (para desarrollo local containerizado)
- Una cuenta de [Supabase](https://supabase.com) (Postgres gestionado) para producción
- PlatformIO o Arduino IDE + ESP32 board package (para compilar/flashear el firmware — no
  incluido en este repo ni verificado aquí por falta de hardware físico)

## Desarrollo local con Docker Compose (recomendado)

```bash
cd docker
cp .env.example .env   # ajustar si se desea
docker compose up --build
```

Esto levanta:
- `postgres` — Postgres 16 local (sustituto de Supabase; mismo `DATABASE_URL` funciona con ambos)
- `backend` — aplica migraciones y arranca en `http://localhost:4000`
- `frontend` — build de producción servido por nginx en `http://localhost:5173`

Verificar que todo funciona:
```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/cajones   # deben verse los 10 cajones sembrados
```

Login de administrador por defecto (cambiar en `docker/.env` / producción):
- usuario: `admin`
- contraseña: `admin123`

## Desarrollo local sin Docker

```bash
# Backend
cd backend
cp .env.example .env        # apuntar DATABASE_URL a un Postgres local o Supabase
npm install
npm run migrate
npm run dev                 # http://localhost:4000

# Frontend (en otra terminal)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm install
npm run dev                  # http://localhost:5173
```

## Firmware ESP32

1. Abrir `firmware/firmware_esp32/firmware_esp32.ino` en Arduino IDE, o `firmware/` como
   proyecto de PlatformIO (`pio run` desde esa carpeta).
2. Editar `firmware/firmware_esp32/config_pines.h`: `WIFI_SSID`, `WIFI_PASSWORD`,
   `BACKEND_HOST` (IP o dominio del backend) y `BACKEND_PORT`.
3. Instalar las librerías listadas en `firmware/platformio.ini` (`lib_deps`) si se usa
   Arduino IDE manualmente: MFRC522, LiquidCrystal_I2C, ESP32Servo, arduinoWebSockets, ArduinoJson.
4. Flashear al ESP32. El firmware es no bloqueante (sin `delay()` en `loop()`) y se
   reconecta solo si pierde la conexión WebSocket.

> Nota: en este entorno de desarrollo no hay un ESP32 físico ni toolchain de compilación
> instalado, por lo que el firmware fue verificado por revisión manual cuidadosa del código
> (contrastado contra la API real de la librería `arduinoWebSockets`/`SocketIOclient`), no
> compilado ni flasheado. Se recomienda validar la compilación con `pio run` antes de flashear.

## Variables de entorno

Ver `backend/.env.example`, `frontend/.env.example` y `docker/.env.example` para la lista
completa. Las más relevantes:

| Variable | Dónde | Descripción |
|---|---|---|
| `DATABASE_URL` | backend | Cadena de conexión Postgres (Supabase en prod) |
| `JWT_SECRET` | backend | Secreto para firmar los tokens de admin |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | backend | Credenciales del único usuario admin (se siembran al arrancar) |
| `RESERVATION_DURATION_MINUTES` | backend | Duración de una reserva (default 1, para pruebas) |
| `MAX_RESERVAS_ACTIVAS` | backend | Límite de reservas simultáneas (default 5 = 50% de 10) |
| `CORS_ORIGIN` | backend | Origen permitido (URL del frontend) |
| `VITE_API_URL` | frontend | URL del backend (REST + Socket.io) |

## Despliegue en Render + Supabase

1. Crear un proyecto en Supabase y copiar su cadena de conexión Postgres (Settings → Database).
2. En Supabase, ejecutar las migraciones de `backend/src/db/migrations/*.sql` en orden (vía
   el editor SQL de Supabase, o apuntando `DATABASE_URL` a Supabase y corriendo
   `npm run migrate` localmente una vez).
3. En Render, crear un Blueprint apuntando a este repo (usa `render.yaml` automáticamente).
   Define manualmente en el dashboard las variables marcadas `sync: false`:
   `DATABASE_URL` (la de Supabase) y `ADMIN_PASSWORD`.
4. Los nombres de servicio en `render.yaml` (`iotparking-backend`, `iotparking-frontend`)
   determinan las URLs `https://<nombre>.onrender.com` usadas en `CORS_ORIGIN` y
   `VITE_API_URL`; si Render asigna un nombre distinto (por colisión), actualizar esas
   dos variables para que coincidan.
5. El frontend se despliega como **static site** de Render (no Docker), porque Vite necesita
   `VITE_API_URL` disponible en tiempo de build y el blueprint de Render no soporta build args
   para servicios Docker.

## Verificación realizada

- Backend: probado end-to-end contra un Postgres real (migraciones, login, reglas de
  capacidad/reservas, expiración automática de reservas, flujo RFID completo vía
  Socket.io, y los 4 endpoints de reportes) — ver historial de commits para el detalle.
- Frontend: `npm run build` exitoso; flujo de datos verificado contra el backend real
  (contrato de sockets/REST). No se realizó verificación visual en navegador real por no
  contar con herramienta de automatización de navegador en este entorno.
- Docker: `docker compose build` y `docker compose up` verificados end-to-end (los 3
  servicios arrancan, se comunican, y el flujo de negocio completo funciona containerizado).
- Firmware: revisión manual de código únicamente (no hay hardware ESP32 ni toolchain de
  compilación disponibles en este entorno).
- CI (GitHub Actions): workflow agregado en `.github/workflows/ci.yml`; correrá en el
  primer push/PR al repositorio remoto.
