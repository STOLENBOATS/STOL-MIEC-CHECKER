-- MIEC — Patch #2 — Supabase schema (history + RLS)
-- Requer supabase_js v2 no cliente e autenticação ativa

-- Extensões (normalmente já ativas no Supabase)
-- create extension if not exists "pgcrypto";

create table if not exists public.history_win (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ts bigint not null,
  win text not null,
  result text,
  reason text,
  photo text,
  version text,
  device text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.history_motor (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ts bigint not null,
  brand text not null,
  ident text not null,
  result text,
  reason text,
  photo text,
  version text,
  device text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- índices únicos para permitir upsert sem duplicar
create unique index if not exists uq_history_win_user_ts_win
  on public.history_win (user_id, ts, win);

create unique index if not exists uq_history_motor_user_ts_brand_ident
  on public.history_motor (user_id, ts, brand, ident);

-- Row Level Security
alter table public.history_win enable row level security;
alter table public.history_motor enable row level security;

-- Políticas (cada utilizador só vê e mexe nos seus registos)
create policy if not exists "win_select_self" on public.history_win
  for select using (auth.uid() = user_id);

create policy if not exists "win_insert_self" on public.history_win
  for insert with check (auth.uid() = user_id);

create policy if not exists "win_update_self" on public.history_win
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "win_delete_self" on public.history_win
  for delete using (auth.uid() = user_id);

create policy if not exists "motor_select_self" on public.history_motor
  for select using (auth.uid() = user_id);

create policy if not exists "motor_insert_self" on public.history_motor
  for insert with check (auth.uid() = user_id);

create policy if not exists "motor_update_self" on public.history_motor
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "motor_delete_self" on public.history_motor
  for delete using (auth.uid() = user_id);

-- Updated_at trigger (opcional)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_history_win_updated on public.history_win;
create trigger trg_history_win_updated before update on public.history_win
for each row execute function public.set_updated_at();

drop trigger if exists trg_history_motor_updated on public.history_motor;
create trigger trg_history_motor_updated before update on public.history_motor
for each row execute function public.set_updated_at();