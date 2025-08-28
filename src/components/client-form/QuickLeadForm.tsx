import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { quickLeadSchema, QuickLeadValues, QuickLeadFormProps } from "./quickLeadTypes";
import { EventCategory } from "@/utils/types";

const eventCategories: EventCategory[] = [
  "Casamento",
  "15 anos", 
  "Aniversario"
];

const leadSources = [
  "Facebook",
  "Instagram", 
  "Indicações",
  "Website",
  "Telefone",
  "E-mail",
  "WhatsApp",
  "Outros"
];

export function QuickLeadForm({ onSubmit, isSubmitting = false, onCancel }: QuickLeadFormProps) {
  const form = useForm<QuickLeadValues>({
    resolver: zodResolver(quickLeadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      weddingDate: null,
      eventCategory: "Casamento",
      leadSource: "Não informado",
      notes: "",
    },
  });

  const handleSubmit = (data: QuickLeadValues) => {
    onSubmit(data);
  };

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Adicionar Lead Rápido</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre apenas as informações essenciais. Mais detalhes podem ser adicionados depois.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nome *</FormLabel>
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
                <FormItem>
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

            <FormField
              control={form.control}
              name="leadSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Origem do Lead *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Como chegou até você?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
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
              name="eventCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Tipo de Evento</FormLabel>
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
                  <FormLabel className="text-foreground">Data do Evento (Aproximada)</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione uma data"
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
                <FormLabel className="text-foreground">Observações Iniciais</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informações básicas sobre o cliente ou evento"
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
                  Adicionando...
                </span>
              ) : (
                "Adicionar Lead"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}