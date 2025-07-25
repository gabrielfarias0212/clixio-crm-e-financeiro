
-- Criar tabela para templates de contratos
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para templates
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para templates
CREATE POLICY "Users can view their own templates" ON contract_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" ON contract_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON contract_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON contract_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Atualizar tabela de contratos com novos campos
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES contract_templates(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'wedding';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS guest_count INTEGER;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS package_name TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS included_items TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_address TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_city TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS event_city TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS event_address TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS bride_rg TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS groom_rg TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_name TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_email TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_phone TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS couple_names TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_content TEXT;

-- Atualizar RLS para contratos
DROP POLICY IF EXISTS "Users can manage their own contracts" ON contracts;

CREATE POLICY "Users can view their own contracts" ON contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contracts" ON contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts" ON contracts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts" ON contracts
  FOR DELETE USING (auth.uid() = user_id);

-- Inserir template padrão
INSERT INTO contract_templates (user_id, name, content, is_default)
SELECT auth.uid(), 'Template Padrão de Casamento', 
'CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

CONTRATANTE: {{nomeContratante}}
CASAL: {{nomeCasal}}
RG: {{rg}}
CPF: {{cpf}}
TELEFONE: {{telefone}}
E-MAIL: {{email}}
ENDEREÇO: {{enderecoContratante}}
CIDADE: {{cidadeContratante}}

EVENTO:
Data: {{dataEvento}}
Horário: {{horarioEvento}}
Local: {{enderecoEvento}}
Cidade: {{cidadeEvento}}
Tipo: {{tipoEvento}}
Convidados: {{numeroConvidados}}

PACOTE CONTRATADO: {{pacoteEscolhido}}
ITENS INCLUSOS: {{itensInclusos}}
FORMA DE PAGAMENTO: {{formaPagamento}}
VALOR TOTAL: {{precoTotal}}

Este contrato é firmado entre as partes em {{dataAtual}}.

_____________________
Assinatura do Contratante

_____________________
Assinatura do Prestador', 
true
WHERE auth.uid() IS NOT NULL;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_contract_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contract_templates_updated_at
    BEFORE UPDATE ON contract_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_contract_templates_updated_at();
