-- Corrigir a função para ter search_path seguro
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;