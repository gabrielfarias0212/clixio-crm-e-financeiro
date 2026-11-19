-- Nome livre que o usuário dá a um lançamento (ex.: "Lente 24-70"), para lembrar do que foi.
alter table public.fin_lancamentos add column if not exists apelido text;
