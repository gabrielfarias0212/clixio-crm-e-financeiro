
-- Remove categorias financeiras que referenciam usuários inexistentes
DELETE FROM public.financial_categories
WHERE photographer_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = public.financial_categories.photographer_id
);

-- Remove a referência incorreta da tabela de fotógrafos, se existir
ALTER TABLE public.financial_categories DROP CONSTRAINT IF EXISTS financial_categories_photographer_id_fkey;

-- Adiciona a referência correta para a tabela de usuários autenticados
ALTER TABLE public.financial_categories ADD CONSTRAINT financial_categories_photographer_id_fkey
FOREIGN KEY (photographer_id) REFERENCES auth.users(id) ON DELETE CASCADE;
