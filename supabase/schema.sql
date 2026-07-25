-- ============================================================
-- Notion-Tasks-App schema
-- Paste this entire file into the Supabase SQL Editor and run it.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- tasks
-- ============================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_due_idx on public.tasks (user_id, due_date);

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ============================================================
-- habits
-- ============================================================
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  recurrence text not null default 'daily' check (recurrence in ('daily')),
  reminder_time time,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "habits_select_own" on public.habits
  for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits
  for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits
  for update using (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits
  for delete using (auth.uid() = user_id);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- ============================================================
-- habit_logs (one row = habit was completed on that date)
-- ============================================================
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_date)
);

create index habit_logs_habit_date_idx on public.habit_logs (habit_id, completed_date);

alter table public.habit_logs enable row level security;

create policy "habit_logs_select_own" on public.habit_logs
  for select using (auth.uid() = user_id);
create policy "habit_logs_insert_own" on public.habit_logs
  for insert with check (auth.uid() = user_id);
create policy "habit_logs_delete_own" on public.habit_logs
  for delete using (auth.uid() = user_id);

-- ============================================================
-- pages (notes) — parent_id present now for future nesting
-- ============================================================
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  parent_id uuid references public.pages(id) on delete cascade,
  title text not null default 'Untitled',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pages_user_parent_idx on public.pages (user_id, parent_id);

alter table public.pages enable row level security;

create policy "pages_select_own" on public.pages
  for select using (auth.uid() = user_id);
create policy "pages_insert_own" on public.pages
  for insert with check (auth.uid() = user_id);
create policy "pages_update_own" on public.pages
  for update using (auth.uid() = user_id);
create policy "pages_delete_own" on public.pages
  for delete using (auth.uid() = user_id);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();
