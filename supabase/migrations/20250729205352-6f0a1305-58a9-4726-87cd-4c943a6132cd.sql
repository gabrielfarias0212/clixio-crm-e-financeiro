
-- Adicionar colunas faltantes na tabela contracts
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS contract_number integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rg text DEFAULT '',
ADD COLUMN IF NOT EXISTS ceremonial_team text;

-- Criar tabela contract_clauses
CREATE TABLE IF NOT EXISTS public.contract_clauses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  clause_order integer NOT NULL DEFAULT 1,
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela contract_clauses
ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para contract_clauses
CREATE POLICY "Users can view their own clauses" 
  ON public.contract_clauses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clauses" 
  ON public.contract_clauses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clauses" 
  ON public.contract_clauses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clauses" 
  ON public.contract_clauses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_contract_clauses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contract_clauses_updated_at
    BEFORE UPDATE ON public.contract_clauses
    FOR EACH ROW
    EXECUTE FUNCTION update_contract_clauses_updated_at();

-- Criar template padrão se não existir
INSERT INTO public.contract_templates (user_id, name, content, is_default)
SELECT 
  auth.uid(),
  'Template Padrão',
  'CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

CONTRATANTE: {{nomeContratante}}
CASAL: {{nomeCasal}}
DATA DO EVENTO: {{dataEvento}}
RG: {{rg}}
CPF: {{cpf}}
TELEFONE: {{telefone}}
EMAIL: {{email}}
ENDEREÇO: {{enderecoContratante}}
CIDADE: {{cidadeContratante}}

DADOS DO EVENTO:
CIDADE: {{cidadeEvento}}
LOCAL: {{enderecoEvento}}
HORÁRIO: {{horarioEvento}}
CONVIDADOS: {{numeroConvidados}}
EQUIPE CERIMONIAL: {{equipeCerimonial}}

PACOTE ESCOLHIDO: {{pacoteEscolhido}}
ITENS INCLUSOS: {{itensInclusos}}
FORMA DE PAGAMENTO: {{formaPagamento}}
VALOR TOTAL: {{precoTotal}}
TIPO DE EVENTO: {{tipoEvento}}

Data: {{dataAtual}}',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.contract_templates 
  WHERE user_id = auth.uid() AND is_default = true
);

-- Inserir cláusulas padrão para todos os usuários
INSERT INTO public.contract_clauses (user_id, title, content, clause_order, is_required)
SELECT 
  auth.uid(),
  'OBJETO DO CONTRATO',
  'A CONTRATADA prestará ao CONTRATANTE os serviços de cobertura fotográfica para o evento acima descrito, respeitando os padrões técnicos e artísticos da empresa.',
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.contract_clauses 
  WHERE user_id = auth.uid() AND title = 'OBJETO DO CONTRATO'
);

INSERT INTO public.contract_clauses (user_id, title, content, clause_order, is_required)
SELECT 
  auth.uid(),
  'EXCLUSIVIDADE',
  'A equipe da Gabriel Farias Fotografias será a única responsável pela cobertura do evento. A contratação de outro profissional sem consentimento resultará na rescisão do contrato e retenção de 30% do valor.',
  2,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.contract_clauses 
  WHERE user_id = auth.uid() AND title = 'EXCLUSIVIDADE'
);

INSERT INTO public.contract_clauses (user_id, title, content, clause_order, is_required)
SELECT 
  auth.uid(),
  'VALOR E FORMA DE PAGAMENTO',
  'Valor total: {{precoTotal}}
Forma de pagamento: {{formaPagamento}}
*A hora extra, se houver, será cobrada à parte no valor de R$ 600,00 por hora ou fração superior a 30 minutos.*',
  3,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.contract_clauses 
  WHERE user_id = auth.uid() AND title = 'VALOR E FORMA DE PAGAMENTO'
);
