-- Migration: add DSA as a valid focus category
-- Run this in Supabase after your existing schema is already created

BEGIN;

DO $$
DECLARE
  existing_constraint text;
BEGIN
  SELECT con.conname
    INTO existing_constraint
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = con.connamespace
  WHERE rel.relname = 'focus_logs'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%category IN (''GATE'', ''DEVELOPMENT'', ''RESEARCH'', ''COLLEGE'')%';

  IF existing_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE focus_logs DROP CONSTRAINT %I', existing_constraint);
  END IF;
END $$;

ALTER TABLE focus_logs
  DROP CONSTRAINT IF EXISTS focus_logs_category_check;

ALTER TABLE focus_logs
  ADD CONSTRAINT focus_logs_category_check
  CHECK (category IN ('GATE', 'DSA', 'DEVELOPMENT', 'RESEARCH', 'COLLEGE'));

COMMIT;
