
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
import { ClientFormValues } from "../types";

interface StatusFieldsProps {
  control: Control<ClientFormValues>;
}

export function StatusFields({ control }: StatusFieldsProps) {
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
                <SelectItem value="novo lead">Novo lead</SelectItem>
                <SelectItem value="proposta enviada">Proposta enviada</SelectItem>
                <SelectItem value="negociação">Negociação</SelectItem>
                <SelectItem value="fechado (aguardando assinatura)">Fechado (aguardando assinatura)</SelectItem>
                <SelectItem value="contrato assinado">Contrato assinado</SelectItem>
                <SelectItem value="contrato oficializado e entrada confirmada">Contrato oficializado e entrada confirmada</SelectItem>
                <SelectItem value="pré-wedding agendado">Pré-wedding agendado</SelectItem>
                <SelectItem value="pré-wedding feito">Pré-wedding feito</SelectItem>
                <SelectItem value="pré-wedding entregue">Pré-wedding entregue</SelectItem>
                <SelectItem value="evento principal fotografado">Evento principal fotografado</SelectItem>
                <SelectItem value="material em pós-produção">Material em pós-produção</SelectItem>
                <SelectItem value="galeria/link entregue">Galeria/link entregue</SelectItem>
                <SelectItem value="álbum aprovado / em produção">Álbum aprovado / em produção</SelectItem>
                <SelectItem value="cliente escolheu as fotos e álbum está sendo feito">Cliente escolheu as fotos e álbum está sendo feito</SelectItem>
                <SelectItem value="trabalho entregue">Trabalho entregue</SelectItem>
                <SelectItem value="todas as entregas finalizadas">Todas as entregas finalizadas</SelectItem>
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
                <SelectItem value="enviar proposta inicial">Enviar proposta inicial</SelectItem>
                <SelectItem value="aguardar resposta do cliente">Aguardar resposta do cliente</SelectItem>
                <SelectItem value="negociar condições">Negociar condições</SelectItem>
                <SelectItem value="preparar contrato">Preparar contrato</SelectItem>
                <SelectItem value="oficializar entrada">Oficializar entrada</SelectItem>
                <SelectItem value="agendar pré-wedding">Agendar pré-wedding</SelectItem>
                <SelectItem value="realizar pré-wedding">Realizar pré-wedding</SelectItem>
                <SelectItem value="editar e entregar pré-wedding">Editar e entregar pré-wedding</SelectItem>
                <SelectItem value="fotografar evento principal">Fotografar evento principal</SelectItem>
                <SelectItem value="iniciar pós-produção">Iniciar pós-produção</SelectItem>
                <SelectItem value="preparar galeria">Preparar galeria</SelectItem>
                <SelectItem value="apresentar álbum">Apresentar álbum</SelectItem>
                <SelectItem value="produzir álbum">Produzir álbum</SelectItem>
                <SelectItem value="finalizar entregas">Finalizar entregas</SelectItem>
                <SelectItem value="nenhuma ação pendente">Nenhuma ação pendente</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
