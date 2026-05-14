import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Link2, HardDrive } from "lucide-react";
import { EventCategory, Client } from "@/utils/types";
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
  phone: z.string().optional(),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal("")),
  weddingDate: z.string().nullable(),
  eventCategory: z.string().default("Casamento"),
  eventLocation: z.string().optional(),
  weddingStartTime: z.string().optional(),
  weddingEndTime: z.string().optional(),
  contractValue: z.number().optional().default(0),
  notes: z.string().optional(),
  linkedClientId: z.string().optional(),
  storageLocation: z.string().optional(),
});

type QuickProjectValues = z.infer<typeof quickProjectSchema>;

interface QuickProjectFormProps {
  onSubmit: (values: QuickProjectValues) => void;
  onCancel: () => void;
}

export function QuickProjectForm({ onSubmit, onCancel }: QuickProjectFormProps) {
  const { addClient, clients } = useClients();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filtrar apenas clientes fechados que podem ser vinculados
  const availableClients = useMemo(() => {
    return clients.filter(client => 
      client.status === "fechado" && 
      client.name
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const form = useForm<QuickProjectValues>({
    resolver: zodResolver(quickProjectSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      weddingDate: null,
      eventCategory: "Casamento",
      eventLocation: "",
      weddingStartTime: "",
      weddingEndTime: "",
      contractValue: 0,
      notes: "",
      linkedClientId: "",
      storageLocation: "",
    },
  });

  const linkedClientId = form.watch("linkedClientId");

  // Quando selecionar um cliente existente, preencher os campos
  React.useEffect(() => {
    if (linkedClientId && linkedClientId !== "new") {
      const selectedClient = clients.find(c => c.id === linkedClientId);
      if (selectedClient) {
        form.setValue("name", selectedClient.name || "");
        form.setValue("phone", selectedClient.phone || "");
        form.setValue("email", selectedClient.email || "");
        form.setValue("eventCategory", selectedClient.eventCategory || "Casamento");
        form.setValue("eventLocation", selectedClient.eventLocation || "");
        form.setValue("storageLocation", selectedClient.storageLocation || "");
        form.setValue("weddingStartTime", selectedClient.weddingStartTime || "");
        form.setValue("weddingEndTime", selectedClient.weddingEndTime || "");
        form.setValue("contractValue", selectedClient.contractValue || 0);
        if (selectedClient.weddingDate) {
          form.setValue("weddingDate", selectedClient.weddingDate);
        }
      }
    }
  }, [linkedClientId, clients, form]);

  const handleSubmit = async (data: QuickProjectValues) => {
    setIsSubmitting(true);
    
    try {
      // Criar cliente com status "fechado" para aparecer no workflow
      const clientData = {
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        weddingDate: data.weddingDate,
        eventCategory: data.eventCategory as EventCategory,
        eventLocation: data.eventLocation || "",
        weddingStartTime: data.weddingStartTime || "",
        weddingEndTime: data.weddingEndTime || "",
        notes: data.notes || "",
        status: "fechado" as const,
        contractValue: data.contractValue || 0,
        downPayment: 0,
        salesFunnelStage: "contrato_fechado" as const,
        leadSource: "Projeto Direto",
        preWeddingDate: null,
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
        hasPreWedding: false,
        storageLocation: data.storageLocation || "",
        workflowStage: "evento_ensaio" as const,
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
          {/* Vincular a cliente existente */}
          {availableClients.length > 0 && (
            <FormField
              control={form.control}
              name="linkedClientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Vincular a Cliente Existente (opcional)
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Criar novo projeto sem vínculo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">Criar novo projeto sem vínculo</SelectItem>
                      {availableClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.eventCategory ? `(${client.eventCategory})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                  <FormControl>
                    <CategorySelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weddingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Data do Evento</FormLabel>
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
                  <FormLabel className="text-foreground">Telefone</FormLabel>
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
                  <FormLabel className="text-foreground">Email</FormLabel>
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

          {/* Dados do Evento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="eventLocation"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel className="text-foreground">Local do Evento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Espaço XYZ, Fazenda ABC..."
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
              name="weddingStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Horário Início</FormLabel>
                  <FormControl>
                    <Input 
                      type="time"
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
              name="weddingEndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Horário Fim</FormLabel>
                  <FormControl>
                    <Input 
                      type="time"
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
              name="contractValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Valor do Contrato</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0,00"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
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
            name="storageLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Local de Armazenamento
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: SSD1, HD2, Drive externo..."
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