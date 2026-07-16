CREATE TABLE IF NOT EXISTS cajones (
  id SERIAL PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE CHECK (numero BETWEEN 1 AND 10),
  estado cajon_estado NOT NULL DEFAULT 'disponible',
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  rfid_uid TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  placa_auto TEXT NOT NULL,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usuarios_placa ON usuarios (placa_auto);

CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  cajon_id INTEGER NOT NULL REFERENCES cajones (id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios (id) ON DELETE SET NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_fin TIMESTAMPTZ NOT NULL,
  estado reserva_estado NOT NULL DEFAULT 'activa'
);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas (estado);
CREATE INDEX IF NOT EXISTS idx_reservas_cajon ON reservas (cajon_id);
-- Solo puede existir una reserva activa por cajon a la vez
CREATE UNIQUE INDEX IF NOT EXISTS one_active_reserva_per_cajon
  ON reservas (cajon_id) WHERE (estado = 'activa');

CREATE TABLE IF NOT EXISTS historial_accesos (
  id SERIAL PRIMARY KEY,
  placa_auto TEXT,
  rfid_uid TEXT,
  evento evento_acceso NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_historial_placa ON historial_accesos (placa_auto);
CREATE INDEX IF NOT EXISTS idx_historial_rfid ON historial_accesos (rfid_uid);
CREATE INDEX IF NOT EXISTS idx_historial_timestamp ON historial_accesos ("timestamp");

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
