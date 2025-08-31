-- forensic_dossiers — metadados mínimos (POC)
create table if not exists public.forensic_dossiers (
  sha256 text primary key,
  user_id uuid references auth.users(id) on delete set null,
  ts bigint not null,
  kind text check (kind in ('HIN','MOTOR','NA')) default 'NA',
  hin text,
  brand text,
  ident text,
  created_at timestamptz not null default now()
);
alter table public.forensic_dossiers enable row level security;
drop policy if exists fd_select_self on public.forensic_dossiers;
create policy fd_select_self on public.forensic_dossiers for select using (auth.uid() = user_id);
drop policy if exists fd_upsert_self on public.forensic_dossiers;
create policy fd_upsert_self on public.forensic_dossiers for insert with check (auth.uid() = user_id);
drop policy if exists fd_update_self on public.forensic_dossiers;
create policy fd_update_self on public.forensic_dossiers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
