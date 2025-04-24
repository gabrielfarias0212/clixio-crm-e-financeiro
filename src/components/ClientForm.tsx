import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Client, ClientStatus, NextAction } from "@/utils/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

const EVENT_CATEGORIES = [
  "casamento",
  "aniversário",
  "ensaio",
  "evento corporativo",
  "potencial cliente",
  "outro",
];

const formSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(1, { message: "O telefone é obrigatório" }),
  weddingDate: z.date().nullable(),
  contractValue: z.coerce.number().min(0, { message: "O valor deve ser positivo" }),
  downPayment: z.coerce.number().min(0, { message: "O valor deve ser positivo" }),
  status: z.enum(["orçamento enviado", "follow-up", "fechado", "em andamento", "pago"]),
  nextAction: z.enum(["responder", "enviar proposta", "editar", "entregar", "nenhuma"]),
  notes: z.string().optional(),
  eventCategory: z.string().min(1, { message: "Selecione uma categoria" }),
})
.refine(data => data.downPayment <= data.contractValue, {
  message: "O valor da entrada não pode ser maior que o valor do contrato",
  path: ["downPayment"],
});

export type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormValues) => void;
  isSubmitting?: boolean;
}

export function ClientForm({ client, onSubmit, isSubmitting = false }: ClientFormProps) {
  const navigate = useNavigate();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: client
      ? {
          name: client.name,
          email: client.email,
          phone: client.phone,
          weddingDate: client.weddingDate,
          contractValue: client.contractValue,
          downPayment: client.downPayment,
          status: client.status,
          nextAction: client.nextAction,
          notes: client.notes,
          eventCategory: client.eventCategory || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          weddingDate: null,
          contractValue: 0,
          downPayment: 0,
          status: "orçamento enviado",
          nextAction: "enviar proposta",
          notes: "",
          eventCategory: "",
        },
  });

  const handleSubmit = (data: ClientFormValues) => {
    const sanitizedData = {
      ...data,
      eventCategory: data.eventCategory || 'outro'
    };
    onSubmit(sanitizedData);
  };

  const watchStatus = form.watch("status");
  const watchContractValue = form.watch("contractValue");
  const watchDownPayment = form.watch("downPayment");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status do Contrato</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  // Reset downpayment when changing to initial statuses
                  if (value === "orçamento enviado" || value === "follow-up") {
                    form.setValue("downPayment", 0);
                  }
                }} defaultValue={field.value}>
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
            control={form.control}
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
            control={form.control}
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
                      <SelectItem key={ec} value={ec}>{ec.charAt(0).toUpperCase() + ec.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre o cliente e o evento"
                  className="min-h-[120px] resize-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : (client ? "Atualizar Cliente" : "Adicionar Cliente")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
