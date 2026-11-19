-- Conciliação: par de transferência entre contas e vínculo fatura <-> pagamento no extrato.
alter table public.fin_lancamentos add column if not exists par_id uuid;
alter table public.fin_faturas add column if not exists pagamento_lancamento_id uuid;
