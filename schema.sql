-- Полная схема MusterVoin (v2 — недели)
-- Для новой установки выполни весь файл целиком.
-- Для существующей БД (уже есть marks) выполни только блок "МИГРАЦИЯ" внизу.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  week_index int NOT NULL DEFAULT 0 CHECK (week_index BETWEEN 0 AND 12),
  virtue_index int NOT NULL CHECK (virtue_index BETWEEN 0 AND 12),
  day_index int NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  marked boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cycle_id, week_index, virtue_index, day_index)
);

CREATE INDEX IF NOT EXISTS idx_cycles_user ON cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_marks_cycle ON marks(cycle_id);
CREATE INDEX IF NOT EXISTS idx_marks_cycle_week ON marks(cycle_id, week_index);

-- =====================================================================
-- МИГРАЦИЯ (выполни один раз, если таблица marks уже существовала без week_index):
--
--   ALTER TABLE marks ADD COLUMN IF NOT EXISTS week_index int NOT NULL DEFAULT 0;
--   ALTER TABLE marks DROP CONSTRAINT IF EXISTS marks_cycle_id_virtue_index_day_index_key;
--   ALTER TABLE marks ADD CONSTRAINT marks_week_unique
--     UNIQUE (cycle_id, week_index, virtue_index, day_index);
--   ALTER TABLE marks ADD CONSTRAINT marks_week_index_check
--     CHECK (week_index BETWEEN 0 AND 12);
--   CREATE INDEX IF NOT EXISTS idx_marks_cycle_week ON marks(cycle_id, week_index);
-- =====================================================================
