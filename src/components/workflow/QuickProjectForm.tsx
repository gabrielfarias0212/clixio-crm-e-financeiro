import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { EventCategory } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";

const eventCategories: EventCategory[] = [
  "Casamento",
  "15 anos", 
  "Aniversario",
  "Civil",
  "Ensaio Estudio",
  "Ensaio externo",
  "Evento Corporativo"
];

const quickProjectSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  phone: z.string().min(10, {
    message: "Telefone deve ter pelo menos 10 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  weddingDate: z.string().nullable(),
  eventCategory: z.string().default("Casamento"),
  notes: z.string().optional(),
});

type QuickProjectValues = z.infer<typeof quickProjectSchema>;

interface QuickProjectFormProps {
  onSubmit: (values: QuickProjectValues) => void;
  onCancel: () => void;
}

export function QuickProjectForm({ onSubmit, onCancel }: QuickProjectFormProps) {
  const { addClient } = useClients();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<QuickProjectValues>({
    resolver: zodResolver(quickProjectSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      weddingDate: null,
      eventCategory: "Casamento",
      notes: "",
    },
  });

  const handleSubmit = async (data: QuickProjectValues) => {
    setIsSubmitting(true);
    
    try {
      // Criar cliente com status "fechado" para aparecer no workflow
      const clientData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        weddingDate: data.weddingDate,
        eventCategory: data.eventCategory as EventCategory,
        notes: data.notes || "",
        status: "fechado" as const,
        nextAction: "editar" as const,
        contractValue: 0, // Pode ser editado depois
        downPayment: 0,
        salesFunnelStage: "contrato_fechado" as const,
        leadSource: "Projeto Direto",
        preWeddingDate: null, // Campo obrigatório
        // Campos do workflow - começar no primeiro estágio
        weddingPhotographed: false,
        backupCompleted: false,
        curationCompleted: false,
        inEditing: false,
        linkReady: false,
        linkSent: false,
        boxDelivered: false,
        albumApprovedDelivered: false,
        preWeddingScheduled: false,
        preWeddingCompleted: false,
        preWeddingDelivered: false,
        hasPreWedding: false
      };

      await addClient(clientData);
      toast.success("Projeto criado com sucesso!");
      onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast.error("Erro ao criar projeto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Novo Projeto</h2>
          <p className="text-sm text-muted-foreground">
            Cadastre um projeto rapidamente no fluxo de trabalho
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nome do Cliente *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do cliente"
                      {...field}
                      className="focus:ring-2 focus:ring-primary/20 border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Tipo de Evento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weddingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Data do Evento *</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione a data"
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
                  <FormLabel className="text-foreground">Telefone *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000"
                      {...field}
                      className="focus:ring-2 focus:ring-primary/20 border-border"
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
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-foreground">Email *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@exemplo.com"
                      type="email"
                      {...field}
                      className="focus:ring-2 focus:ring-primary/20 border-border"
                    />
                  </FormControl>
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
                <FormLabel className="text-foreground">Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informações adicionais sobre o projeto"
                    className="min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20 border-border"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Criando...
                </span>
              ) : (
                "Criar Projeto"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}