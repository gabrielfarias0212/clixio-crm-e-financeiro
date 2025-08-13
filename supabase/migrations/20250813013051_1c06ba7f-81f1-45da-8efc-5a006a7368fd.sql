
-- Políticas de segurança para permitir que usuários autenticados
-- gerenciem seus próprios arquivos no bucket 'avatars' sem afetar outros usuários.

-- Permitir que QUALQUER usuário (inclusive não autenticado) leia objetos do bucket avatars (opcional para PostgREST; o bucket já é público para CDN)
create policy if not exists "Public can read avatars"
on storage.objects
for select
using (bucket_id = 'avatars');

-- Usuários autenticados podem fazer upload (insert) APENAS dentro da própria pasta: {uid}/...
create policy if not exists "Authenticated users can upload their own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Usuários autenticados podem atualizar (update) APENAS arquivos dentro da própria pasta
create policy if not exists "Authenticated users can update their own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Usuários autenticados podem excluir (delete) APENAS arquivos dentro da própria pasta
create policy if not exists "Authenticated users can delete their own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);
