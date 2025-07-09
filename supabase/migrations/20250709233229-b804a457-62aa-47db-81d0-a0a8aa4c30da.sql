
-- Criar tabela de orçamentos
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  event_date DATE,
  budget_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validity_days INTEGER NOT NULL DEFAULT 15,
  payment_method TEXT,
  payment_conditions TEXT,
  general_notes TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
);

-- Criar tabela de itens do orçamento
CREATE TABLE public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para budgets
CREATE POLICY "Users can create their own budgets" 
  ON public.budgets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own budgets" 
  ON public.budgets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
  ON public.budgets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
  ON public.budgets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para budget_items
CREATE POLICY "Users can create items for their own budgets" 
  ON public.budget_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets 
      WHERE id = budget_items.budget_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view items of their own budgets" 
  ON public.budget_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets 
      WHERE id = budget_items.budget_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of their own budgets" 
  ON public.budget_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets 
      WHERE id = budget_items.budget_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items of their own budgets" 
  ON public.budget_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets 
      WHERE id = budget_items.budget_id 
      AND user_id = auth.uid()
    )
  );

-- Função para atualizar automaticamente o total do orçamento
CREATE OR REPLACE FUNCTION update_budget_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o total do orçamento
  UPDATE public.budgets 
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM public.budget_items 
    WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar o total quando itens são modificados
CREATE TRIGGER update_budget_total_on_insert
  AFTER INSERT ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION update_budget_total();

CREATE TRIGGER update_budget_total_on_update
  AFTER UPDATE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION update_budget_total();

CREATE TRIGGER update_budget_total_on_delete
  AFTER DELETE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION update_budget_total();

-- Trigger para calcular subtotal automaticamente
CREATE OR REPLACE FUNCTION calculate_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subtotal = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_subtotal_before_insert_update
  BEFORE INSERT OR UPDATE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION calculate_item_subtotal();
