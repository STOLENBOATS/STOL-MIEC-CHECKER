-- schema_delta.sql — acrescenta campos opcionais ao histórico WIN
alter table public.history_win
  add column if not exists certificate text,
  add column if not exists issuer text;
