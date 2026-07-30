-- ============================================================
-- Task / habit categories (work, student, fitness, general)
-- Run this AFTER schema.sql has already been applied.
-- Paste into the Supabase SQL Editor and run.
-- ============================================================

alter table public.tasks
  add column category text not null default 'general'
  check (category in ('general', 'work', 'student', 'fitness'));

alter table public.habits
  add column category text not null default 'general'
  check (category in ('general', 'work', 'student', 'fitness'));
