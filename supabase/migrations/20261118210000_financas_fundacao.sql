-- Módulo Finanças — fundação (somente adições; não altera tabelas existentes)
-- Todas as tabelas: user_id NOT NULL + RLS (cada usuário vê só o seu).

create table public.fin_fontes (            -- contas e cartões (C6 PF, Inter PJ, cartões)
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  nome text not null,
  banco text not null,                       -- 'c6' | 'inter' | outro
  tipo text not null check (tipo in ('conta','cartao')),
  pagador text not null check (pagador in ('PF','PJ')),
  dia_fechamento int check (dia_fechamento between 1 and 31),
  dia_vencimento int check (dia_vencimento between 1 and 31),
  conta_pagamento_id uuid references public.fin_fontes(id),  -- conta de onde sai a fatura
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.fin_categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  nome text not null,
  grupo text not null check (grupo in ('fixa','variavel','lazer','imposto','investimento','receita','outro')),
  created_at timestamptz not null default now()
);

create table public.fin_importacoes (       -- log de cada arquivo importado
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  fonte_id uuid not null references public.fin_fontes(id),
  nome_arquivo text,
  formato text,                              -- csv | ofx | pdf
  layout_fingerprint text,                   -- aprende o layout de cada banco
  total_declarado numeric(14,2),
  total_lido numeric(14,2),
  qtd_linhas int,
  enviado_ia boolean not null default false, -- auditoria do que foi para a IA
  created_at timestamptz not null default now()
);

create table public.fin_faturas (           -- ciclo da fatura do cartão
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  fonte_id uuid not null references public.fin_fontes(id),
  competencia date not null,                 -- 1º dia do mês da fatura
  vencimento date,
  valor_total numeric(14,2) not null default 0,
  status text not null default 'aberta'
    check (status in ('aberta','fechada','paga','parcial','vencida')),
  pago_em date,
  valor_pago numeric(14,2),
  created_at timestamptz not null default now(),
  unique (fonte_id, competencia)
);

create table public.fin_lancamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  fonte_id uuid not null references public.fin_fontes(id),
  importacao_id uuid references public.fin_importacoes(id),
  fatura_id uuid references public.fin_faturas(id),
  data date not null,                        -- data da compra / movimento
  descricao text not null,
  descricao_original text,
  valor numeric(14,2) not null,              -- sempre positivo; sentido em 'tipo'
  tipo text not null check (tipo in ('entrada','saida','transferencia','pagamento_fatura','reembolso','estorno')),
  pagador text not null check (pagador in ('PF','PJ')),       -- quem paga
  pertence_a text not null check (pertence_a in ('PF','PJ')), -- a quem pertence
  categoria_id uuid references public.fin_categorias(id),
  parcela_atual int,
  parcela_total int,
  grupo_parcela uuid,                        -- liga as parcelas de uma mesma compra
  status text not null default 'realizado' check (status in ('realizado','projetado')),
  conciliado boolean not null default false,
  hash_dedupe text,
  clixio_transaction_id uuid,                -- vínculo (somente leitura) com wedding_transactions; sem FK de propósito
  clixio_match_status text check (clixio_match_status in ('sugerido','confirmado','rejeitado')),
  clixio_match_score numeric(4,2),
  created_at timestamptz not null default now(),
  check ((parcela_atual is null) = (parcela_total is null))
);
create unique index fin_lancamentos_dedupe on public.fin_lancamentos (user_id, hash_dedupe) where hash_dedupe is not null;
create index fin_lancamentos_data on public.fin_lancamentos (user_id, data);

create table public.fin_regras (            -- "contém X → categoria Y" (aprendizado local)
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  padrao text not null,
  categoria_id uuid references public.fin_categorias(id),
  pertence_a text check (pertence_a in ('PF','PJ')),
  created_at timestamptz not null default now()
);

create table public.fin_reembolsos (        -- PJ pagou no cartão PF (ou vice-versa): saldo a acertar
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  lancamento_id uuid not null references public.fin_lancamentos(id) on delete cascade,
  valor numeric(14,2) not null,
  quitado_em date,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['fin_fontes','fin_categorias','fin_importacoes','fin_faturas','fin_lancamentos','fin_regras','fin_reembolsos']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%1$s_own" on public.%1$I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
