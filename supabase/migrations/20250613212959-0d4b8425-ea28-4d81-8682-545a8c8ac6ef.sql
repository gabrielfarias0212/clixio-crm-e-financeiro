
-- Criar tabela para transações pessoais
CREATE TABLE public.personal_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  pro_labore_week_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.personal_transactions ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem apenas suas próprias transações
CREATE POLICY "Users can view their own personal transactions" 
  ON public.personal_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias transações
CREATE POLICY "Users can insert their own personal transactions" 
  ON public.personal_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias transações
CREATE POLICY "Users can update their own personal transactions" 
  ON public.personal_transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para usuários removerem suas próprias transações
CREATE POLICY "Users can delete their own personal transactions" 
  ON public.personal_transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_personal_transactions_user_id ON public.personal_transactions(user_id);
CREATE INDEX idx_personal_transactions_date ON public.personal_transactions(date);
CREATE INDEX idx_personal_transactions_category ON public.personal_transactions(category);
