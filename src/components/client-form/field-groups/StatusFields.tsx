
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ClientFormValues } from "../types";

interface StatusFieldsProps {
  control: Control<ClientFormValues>;
  showAutomation?: boolean;
}

export function StatusFields({ control, showAutomation = false }: StatusFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status do Contrato</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="novo_lead">Novo Lead</SelectItem>
                <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                <SelectItem value="negociacao">Negociação</SelectItem>
                <SelectItem value="orçamento enviado">Orçamento enviado</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="fechado_aguardando_assinatura">Fechado - Aguardando Assinatura</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
                <SelectItem value="contrato_assinado">Contrato Assinado</SelectItem>
                <SelectItem value="pre_wedding_agendado">Pré-Wedding Agendado</SelectItem>
                <SelectItem value="pre_wedding_feito">Pré-Wedding Feito</SelectItem>
                <SelectItem value="em andamento">Em andamento</SelectItem>
                <SelectItem value="evento_principal_fotografado">Evento Principal Fotografado</SelectItem>
                <SelectItem value="galeria_entregue">Galeria Entregue</SelectItem>
                <SelectItem value="album_aprovado_producao">Álbum Aprovado - Produção</SelectItem>
                <SelectItem value="caixinha_entregue">Caixinha Entregue</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="contrato_concluido">Contrato Concluído</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="nextAction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Próxima Ação</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a próxima ação" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="enviar_proposta">Enviar Proposta</SelectItem>
                <SelectItem value="aguardar_resposta">Aguardar Resposta</SelectItem>
                <SelectItem value="negociar_condicoes">Negociar Condições</SelectItem>
                <SelectItem value="responder">Responder</SelectItem>
                <SelectItem value="enviar proposta">Enviar proposta</SelectItem>
                <SelectItem value="redigir_enviar_contrato">Redigir e Enviar Contrato</SelectItem>
                <SelectItem value="agendar_pre_wedding">Agendar Pré-Wedding</SelectItem>
                <SelectItem value="editar_pre_wedding">Editar Pré-Wedding</SelectItem>
                <SelectItem value="fotografar_evento_principal">Fotografar Evento Principal</SelectItem>
                <SelectItem value="iniciar_edicao">Iniciar Edição</SelectItem>
                <SelectItem value="editar">Editar</SelectItem>
                <SelectItem value="entregar_galeria_digital">Entregar Galeria Digital</SelectItem>
                <SelectItem value="entregar">Entregar</SelectItem>
                <SelectItem value="aprovar_album">Aprovar Álbum</SelectItem>
                <SelectItem value="entregar_caixinha_final">Entregar Caixinha Final</SelectItem>
                <SelectItem value="agradecer_pedir_feedback">Agradecer e Pedir Feedback</SelectItem>
                <SelectItem value="agendar reunião">Agendar reunião</SelectItem>
                <SelectItem value="nenhuma">Nenhuma</SelectItem>
                <SelectItem value="nenhuma_acao_pendente">Nenhuma Ação Pendente</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showAutomation && (
        <FormField
          control={control}
          name="autoUpdateNextAction"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Automação da Próxima Ação
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Atualizar automaticamente a próxima ação baseada no status
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </>
  );
}
