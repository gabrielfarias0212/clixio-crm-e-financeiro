
import { Control } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ClientFormValues } from "./types";
import { EVENT_CATEGORIES } from "./constants";

interface FormFieldsProps {
  control: Control<ClientFormValues>;
  watchStatus: string;
}

export function FormFields({ control, watchStatus }: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Cliente</FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome dos noivos"
                {...field}
                className="focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="email@exemplo.com" 
                type="email"
                {...field}
                className="focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <Input 
                placeholder="(00) 00000-0000" 
                {...field}
                className="focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="weddingDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data do Evento</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              Deixe em branco se ainda não estiver definida
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contractValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor do Contrato/Potencial</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <Input 
                  type="number" 
                  placeholder="0,00" 
                  {...field} 
                  className="pl-8 focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="downPayment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor de Entrada</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <Input 
                  type="number" 
                  placeholder="0,00" 
                  {...field} 
                  className="pl-8 focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
                  disabled={watchStatus === "orçamento enviado" || watchStatus === "follow-up"}
                />
              </div>
            </FormControl>
            {watchStatus === "orçamento enviado" || watchStatus === "follow-up" ? (
              <FormDescription>
                Disponível apenas para contratos fechados
              </FormDescription>
            ) : (
              <FormDescription>
                Valor da entrada inicial (será registrado como primeiro pagamento)
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

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
                <SelectItem value="orçamento enviado">Orçamento enviado</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
                <SelectItem value="em andamento">Em andamento</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
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

      <FormField
        control={control}
        name="eventCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria do Evento</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria do evento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EVENT_CATEGORIES.map((ec) => (
                  <SelectItem key={ec} value={ec}>
                    {ec.charAt(0).toUpperCase() + ec.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
