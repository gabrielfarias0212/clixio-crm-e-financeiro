-- Primeiro, remover o campo workflow_stage se existir
ALTER TABLE public.wedding_clients 
DROP COLUMN IF EXISTS workflow_stage;

-- Adicionar novos campos para controle do fluxo de trabalho
ALTER TABLE public.wedding_clients 
ADD COLUMN IF NOT EXISTS backup_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS curation_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS link_ready boolean DEFAULT false;

-- Criar tipo enum para as etapas do workflow
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_stage_enum') THEN
        CREATE TYPE workflow_stage_enum AS ENUM (
            'evento_ensaio',
            'copia', 
            'backup',
            'curadoria',
            'edicao',
            'link_pronto',
            'link_enviado',
            'entrega_fisica',
            'projeto_finalizado'
        );
    END IF;
END $$;

-- Agora adicionar a coluna workflow_stage com o tipo enum correto
ALTER TABLE public.wedding_clients 
ADD COLUMN workflow_stage workflow_stage_enum DEFAULT 'evento_ensaio';

-- Criar função para atualizar automaticamente o workflow_stage baseado nos campos boolean
CREATE OR REPLACE FUNCTION public.update_workflow_stage()
RETURNS TRIGGER AS $$
BEGIN
    -- Determinar o estágio do workflow baseado nos campos boolean
    IF NEW.status = 'projeto_finalizado' THEN
        NEW.workflow_stage = 'projeto_finalizado';
    ELSIF NEW.box_delivered = true OR NEW.album_approved_delivered = true THEN
        NEW.workflow_stage = 'entrega_fisica';
    ELSIF NEW.link_sent = true THEN
        NEW.workflow_stage = 'link_enviado';
    ELSIF NEW.link_ready = true THEN
        NEW.workflow_stage = 'link_pronto';
    ELSIF NEW.in_editing = true THEN
        NEW.workflow_stage = 'edicao';
    ELSIF NEW.curation_completed = true THEN
        NEW.workflow_stage = 'curadoria';
    ELSIF NEW.backup_completed = true THEN
        NEW.workflow_stage = 'backup';
    ELSIF NEW.wedding_photographed = true THEN
        -- Se o evento foi fotografado, começamos na etapa "copia"
        NEW.workflow_stage = 'copia';
    ELSE
        -- Por padrão, projetos novos começam em "evento_ensaio"
        NEW.workflow_stage = 'evento_ensaio';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar automaticamente o workflow_stage
DROP TRIGGER IF EXISTS trigger_update_workflow_stage ON public.wedding_clients;
CREATE TRIGGER trigger_update_workflow_stage
    BEFORE INSERT OR UPDATE ON public.wedding_clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_workflow_stage();

-- Atualizar clientes existentes para definir o workflow_stage inicial
UPDATE public.wedding_clients 
SET workflow_stage = CASE 
    WHEN status = 'projeto_finalizado' THEN 'projeto_finalizado'::workflow_stage_enum
    WHEN box_delivered = true OR album_approved_delivered = true THEN 'entrega_fisica'::workflow_stage_enum
    WHEN link_sent = true THEN 'link_enviado'::workflow_stage_enum
    WHEN in_editing = true THEN 'edicao'::workflow_stage_enum
    WHEN album_designed = true THEN 'curadoria'::workflow_stage_enum
    WHEN wedding_photographed = true THEN 'copia'::workflow_stage_enum
    ELSE 'evento_ensaio'::workflow_stage_enum
END;