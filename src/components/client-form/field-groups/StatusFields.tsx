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
                <SelectItem value="primeiro_contato">Primeiro Contato</SelectItem>
                <SelectItem value="orçamento enviado">Orçamento Enviado</SelectItem>
                <SelectItem value="negociacao">Follow-up</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
                <SelectItem value="projeto_finalizado">Projeto Finalizado</SelectItem>
                <SelectItem value="contrato_perdido">Contrato Perdido</SelectItem>
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
                <SelectItem value="responder">Responder</SelectItem>
                <SelectItem value="enviar proposta">Enviar proposta</SelectItem>
                <SelectItem value="editar">Editar</SelectItem>
                <SelectItem value="entregar">Entregar</SelectItem>
                <SelectItem value="nenhuma">Nenhuma</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
