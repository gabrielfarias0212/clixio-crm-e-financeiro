-- Índice de dedupe não-parcial (necessário para upsert com ignoreDuplicates) + campo de observação.
drop index if exists public.fin_lancamentos_dedupe;
create unique index fin_lancamentos_dedupe on public.fin_lancamentos (user_id, hash_dedupe);
alter table public.fin_lancamentos add column if not exists obs text;
