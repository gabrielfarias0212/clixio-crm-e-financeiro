
-- Adicionar coluna para fase do funil de vendas na tabela wedding_clients
ALTER TABLE public.wedding_clients 
ADD COLUMN sales_funnel_stage text DEFAULT 'primeiro_contato';

-- Atualizar os registros existentes baseado no status atual
UPDATE public.wedding_clients 
SET sales_funnel_stage = CASE 
  WHEN status = 'orçamento enviado' THEN 'orcamento_enviado'
  WHEN status = 'follow-up' THEN 'negociacao'
  WHEN status = 'fechado' THEN 'contrato_fechado'
  WHEN status = 'em andamento' THEN 'contrato_fechado'
  WHEN status = 'pago' THEN 'contrato_fechado'
  WHEN status = 'entregue' THEN 'projeto_finalizado'
  ELSE 'primeiro_contato'
END;
