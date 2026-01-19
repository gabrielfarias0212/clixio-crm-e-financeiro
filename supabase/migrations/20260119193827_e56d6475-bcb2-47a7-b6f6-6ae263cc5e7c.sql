-- Adicionar campo para local de armazenamento do projeto
ALTER TABLE public.wedding_clients
ADD COLUMN storage_location TEXT;