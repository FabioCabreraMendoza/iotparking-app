-- Tipos enumerados usados por el esquema del estacionamiento
DO $$ BEGIN
  CREATE TYPE cajon_estado AS ENUM ('disponible', 'ocupado', 'reservado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reserva_estado AS ENUM ('activa', 'expirada', 'completada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE evento_acceso AS ENUM ('ENTRADA', 'SALIDA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
