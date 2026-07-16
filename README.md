# IoT Parking — Sistema de Estacionamiento Inteligente (10 cajones)

Monorepo con firmware ESP32, backend (Node/Express/Socket.io), frontend (React/Vite/Tailwind),
migraciones SQL para Supabase/Postgres, Docker y blueprint de Render.

> Documentación completa de arquitectura, variables de entorno y despliegue: ver sección final de este README (se completa al cerrar el setup de Docker/Render).

## Estructura

- `firmware/` — Firmware C++ para ESP32 (PlatformIO).
- `backend/` — API REST + servidor Socket.io.
- `frontend/` — SPA React (vista Usuario `/` y Administrador `/admin`).
- `docker/` — Dockerfiles y `docker-compose.yml` para desarrollo local.
- `render.yaml` — Blueprint de despliegue en Render.
