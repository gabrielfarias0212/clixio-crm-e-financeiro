
-- Criar tabela para armazenar cláusulas de contratos
CREATE TABLE contract_clauses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  variables text[] DEFAULT '{}',
  is_required boolean DEFAULT false,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para campos dinâmicos de contratos
CREATE TABLE contract_fields (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES contract_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'textarea', 'boolean')),
  required boolean DEFAULT false,
  default_value text,
  options text[],
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para versionamento de contratos
CREATE TABLE contract_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES contract_templates(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content_snapshot jsonb NOT NULL,
  changes_description text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

-- Criar tabela para contratos gerados
CREATE TABLE generated_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES contract_templates(id),
  client_id uuid REFERENCES wedding_clients(id),
  title text NOT NULL,
  filled_data jsonb NOT NULL DEFAULT '{}',
  pdf_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'sent', 'signed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Atualizar tabela contract_templates para suportar nova estrutura
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS category text DEFAULT 'custom';
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE contract_templates ADD COLUMN IF NOT EXISTS clauses_order uuid[] DEFAULT '{}';

-- Adicionar RLS policies para contract_clauses
ALTER TABLE contract_clauses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clauses" ON contract_clauses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clauses" ON contract_clauses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clauses" ON contract_clauses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clauses" ON contract_clauses
  FOR DELETE USING (auth.uid() = user_id);

-- Adicionar RLS policies para contract_fields
ALTER TABLE contract_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fields of their templates" ON contract_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contract_templates 
      WHERE contract_templates.id = contract_fields.template_id 
      AND contract_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create fields for their templates" ON contract_fields
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contract_templates 
      WHERE contract_templates.id = contract_fields.template_id 
      AND contract_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update fields of their templates" ON contract_fields
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM contract_templates 
      WHERE contract_templates.id = contract_fields.template_id 
      AND contract_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete fields of their templates" ON contract_fields
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM contract_templates 
      WHERE contract_templates.id = contract_fields.template_id 
      AND contract_templates.user_id = auth.uid()
    )
  );

-- Adicionar RLS policies para contract_versions
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their templates" ON contract_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contract_templates 
      WHERE contract_templates.id = contract_versions.template_id 
      AND contract_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for their templates" ON contract_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contract_templates 
      WHERE contract_templates.id = contract_versions.template_id 
      AND contract_templates.user_id = auth.uid()
    )
  );

-- Adicionar RLS policies para generated_contracts
ALTER TABLE generated_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated contracts" ON generated_contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated contracts" ON generated_contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated contracts" ON generated_contracts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated contracts" ON generated_contracts
  FOR DELETE USING (auth.uid() = user_id);

-- Criar triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contract_clauses_updated_at 
  BEFORE UPDATE ON contract_clauses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_contracts_updated_at 
  BEFORE UPDATE ON generated_contracts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas cláusulas padrão para contratos de casamento
INSERT INTO contract_clauses (user_id, title, content, category, is_default, variables) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Identificação das Partes', 
   'CONTRATANTE: {{bride_name}} e {{groom_name}}, brasileiros, solteiros, portadores dos RGs nº {{bride_rg}} e {{groom_rg}} respectivamente, CPFs nº {{bride_cpf}} e {{groom_cpf}}, residentes e domiciliados em {{contractor_address}}, {{contractor_city}}.

CONTRATADO: {{company_name}}, com sede em {{company_address}}, inscrito no CNPJ sob nº {{company_cnpj}}.', 
   'identification', true, 
   '{"bride_name", "groom_name", "bride_rg", "groom_rg", "bride_cpf", "groom_cpf", "contractor_address", "contractor_city", "company_name", "company_address", "company_cnpj"}'),
   
  ('00000000-0000-0000-0000-000000000000', 'Objeto do Contrato', 
   'O presente contrato tem por objeto a prestação de serviços de fotografia para o evento de {{event_type}} que se realizará no dia {{event_date}}, das {{start_time}} às {{end_time}}, no local {{event_location}}, {{event_address}}.', 
   'service_object', true, 
   '{"event_type", "event_date", "start_time", "end_time", "event_location", "event_address"}'),
   
  ('00000000-0000-0000-0000-000000000000', 'Valor e Forma de Pagamento', 
   'O valor total dos serviços contratados é de R$ {{total_amount}}, que será pago da seguinte forma: {{payment_conditions}}.
   
O pagamento deverá ser efetuado através de {{payment_method}}.', 
   'payment', true, 
   '{"total_amount", "payment_conditions", "payment_method"}'),
   
  ('00000000-0000-0000-0000-000000000000', 'Obrigações do Contratado', 
   'O CONTRATADO se obriga a:
a) Comparecer ao local do evento com antecedência de 30 minutos do horário marcado;
b) Executar os serviços com qualidade profissional;
c) Entregar as fotografias editadas em até {{delivery_days}} dias úteis após o evento;
d) Fornecer {{photos_quantity}} fotografias editadas em alta resolução;
e) Manter sigilo sobre as informações e imagens captadas.', 
   'contractor_obligations', true, 
   '{"delivery_days", "photos_quantity"}');
