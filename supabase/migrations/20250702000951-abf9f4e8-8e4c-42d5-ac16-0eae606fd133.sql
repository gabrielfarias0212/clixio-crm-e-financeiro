
-- Criar tabela de catálogo de serviços
CREATE TABLE public.service_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_price NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  estimated_time TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de catálogo de produtos
CREATE TABLE public.product_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_price NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  product_type TEXT DEFAULT 'album',
  variations JSONB DEFAULT '{}',
  stock_control BOOLEAN DEFAULT false,
  current_stock INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de vendas de serviços
CREATE TABLE public.service_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.wedding_clients(id),
  service_catalog_id UUID REFERENCES public.service_catalog(id),
  service_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pendente',
  installments INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações rápidas (unificada para serviços e produtos)
CREATE TABLE public.quick_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.wedding_clients(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('service', 'product')),
  item_name TEXT NOT NULL,
  catalog_id UUID, -- Referência genérica para service_catalog ou product_catalog
  amount NUMERIC NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pendente',
  installments INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para service_catalog
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own service catalog"
  ON public.service_catalog FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service catalog items"
  ON public.service_catalog FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service catalog items"
  ON public.service_catalog FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service catalog items"
  ON public.service_catalog FOR DELETE
  USING (auth.uid() = user_id);

-- Adicionar RLS para product_catalog
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own product catalog"
  ON public.product_catalog FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product catalog items"
  ON public.product_catalog FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product catalog items"
  ON public.product_catalog FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product catalog items"
  ON public.product_catalog FOR DELETE
  USING (auth.uid() = user_id);

-- Adicionar RLS para service_sales
ALTER TABLE public.service_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own service sales"
  ON public.service_sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service sales"
  ON public.service_sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service sales"
  ON public.service_sales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service sales"
  ON public.service_sales FOR DELETE
  USING (auth.uid() = user_id);

-- Adicionar RLS para quick_transactions
ALTER TABLE public.quick_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quick transactions"
  ON public.quick_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quick transactions"
  ON public.quick_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick transactions"
  ON public.quick_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick transactions"
  ON public.quick_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Expandir a tabela product_sales existente para melhor integração
ALTER TABLE public.product_sales 
ADD COLUMN IF NOT EXISTS catalog_id UUID,
ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'custom';

-- Inserir alguns dados iniciais de exemplo para facilitar os testes
INSERT INTO public.service_catalog (user_id, name, description, default_price, category) VALUES
  (auth.uid(), 'Ensaio Individual', 'Ensaio fotográfico individual em estúdio ou externo', 400.00, 'Ensaios'),
  (auth.uid(), 'Ensaio Casal', 'Ensaio fotográfico para casais', 500.00, 'Ensaios'),
  (auth.uid(), 'Evento Corporativo', 'Cobertura fotográfica de eventos empresariais', 800.00, 'Eventos'),
  (auth.uid(), 'Consultoria Fotográfica', 'Consultoria especializada em fotografia', 200.00, 'Consultoria');

INSERT INTO public.product_catalog (user_id, name, description, default_price, category, product_type) VALUES
  (auth.uid(), 'Álbum 30x40', 'Álbum fotográfico premium 30x40cm', 650.00, 'Álbuns', 'album'),
  (auth.uid(), 'Álbum 25x35', 'Álbum fotográfico standard 25x35cm', 450.00, 'Álbuns', 'album'),
  (auth.uid(), 'Moldura 40x60', 'Moldura premium para fotos 40x60cm', 180.00, 'Molduras', 'frame'),
  (auth.uid(), 'Canvas 50x70', 'Impressão em canvas 50x70cm', 320.00, 'Canvas', 'canvas'),
  (auth.uid(), 'Impressão 20x30', 'Impressão fotográfica premium 20x30cm', 45.00, 'Impressões', 'print');
