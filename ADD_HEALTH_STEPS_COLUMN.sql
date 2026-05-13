-- Migration: add steps to health_logs
-- Run this in Supabase after your existing schema is already created

BEGIN;

ALTER TABLE health_logs
  ADD COLUMN IF NOT EXISTS steps INTEGER;

ALTER TABLE health_logs
  DROP CONSTRAINT IF EXISTS health_logs_steps_check;

ALTER TABLE health_logs
  ADD CONSTRAINT health_logs_steps_check
  CHECK (steps IS NULL OR steps >= 0);

COMMIT;
