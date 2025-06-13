
-- Criar tabela para categorias personalizadas
CREATE TABLE public.personal_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.personal_categories ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem apenas suas próprias categorias
CREATE POLICY "Users can view their own personal categories" 
  ON public.personal_categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias categorias
CREATE POLICY "Users can insert their own personal categories" 
  ON public.personal_categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias categorias
CREATE POLICY "Users can update their own personal categories" 
  ON public.personal_categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para usuários removerem suas próprias categorias
CREATE POLICY "Users can delete their own personal categories" 
  ON public.personal_categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_personal_categories_user_id ON public.personal_categories(user_id);
CREATE INDEX idx_personal_categories_type ON public.personal_categories(type);
