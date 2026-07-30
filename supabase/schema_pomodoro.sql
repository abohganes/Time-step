-- ============================================================
-- Pomodoro session history
-- Run this AFTER schema.sql and schema_assistant.sql have already
-- been applied. Paste into the Supabase SQL Editor and run.
-- ============================================================

create table public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  duration_minutes integer not null,
  completed_at timestamptz not null default now()
);

create index pomodoro_sessions_user_completed_idx on public.pomodoro_sessions (user_id, completed_at);

alter table public.pomodoro_sessions enable row level security;

create policy "pomodoro_sessions_select_own" on public.pomodoro_sessions
  for select using (auth.uid() = user_id);
create policy "pomodoro_sessions_insert_own" on public.pomodoro_sessions
  for insert with check (auth.uid() = user_id);
create policy "pomodoro_sessions_delete_own" on public.pomodoro_sessions
  for delete using (auth.uid() = user_id);
