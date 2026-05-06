-- Message templates for CRM funnel stages
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  stage text not null default 'geral',
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.message_templates enable row level security;

create policy "Users manage own templates"
  on public.message_templates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists message_templates_user_id_idx on public.message_templates(user_id);
create index if not exists message_templates_stage_idx on public.message_templates(stage);
