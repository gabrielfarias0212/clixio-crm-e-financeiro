
-- Criar tabela para contas fixas pessoais
CREATE TABLE public.personal_fixed_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  due_date INTEGER CHECK (due_date >= 1 AND due_date <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.personal_fixed_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas suas próprias contas fixas
CREATE POLICY "Users can view their own fixed expenses" 
  ON public.personal_fixed_expenses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fixed expenses" 
  ON public.personal_fixed_expenses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixed expenses" 
  ON public.personal_fixed_expenses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixed expenses" 
  ON public.personal_fixed_expenses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personal_fixed_expenses_updated_at 
  BEFORE UPDATE ON public.personal_fixed_expenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
