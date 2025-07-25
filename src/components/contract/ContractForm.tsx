
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContractFormData } from "@/types/contract";

const contractFormSchema = z.object({
  contractorName: z.string().min(1, "Nome é obrigatório"),
  coupleNames: z.string().min(1, "Nome do casal é obrigatório"),
  eventDate: z.string().min(1, "Data do evento é obrigatória"),
  brideRg: z.string().min(1, "RG da noiva é obrigatório"),
  groomRg: z.string().min(1, "RG do noivo é obrigatório"),
  cpf: z.string().min(11, "CPF é obrigatório"),
  phone: z.string().min(10, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  contractorAddress: z.string().min(1, "Endereço é obrigatório"),
  contractorCity: z.string().min(1, "Cidade do contratante é obrigatória"),
  eventCity: z.string().min(1, "Cidade do evento é obrigatória"),
  eventAddress: z.string().min(1, "Endereço do evento é obrigatório"),
  eventTime: z.string().min(1, "Horário do evento é obrigatório"),
  guestCount: z.number().min(1, "Número de convidados é obrigatório"),
  packageName: z.string().min(1, "Pacote é obrigatório"),
  includedItems: z.string().min(1, "Itens inclusos são obrigatórios"),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  totalPrice: z.number().min(1, "Preço total é obrigatório"),
  eventType: z.string().min(1, "Tipo de evento é obrigatório"),
});

interface ContractFormProps {
  onSubmit: (data: ContractFormData) => void;
  initialData?: ContractFormData;
}

export function ContractForm({ onSubmit, initialData }: ContractFormProps) {
  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: initialData || {
      contractorName: "",
      coupleNames: "",
      eventDate: "",
      brideRg: "",
      groomRg: "",
      cpf: "",
      phone: "",
      email: "",
      contractorAddress: "",
      contractorCity: "",
      eventCity: "",
      eventAddress: "",
      eventTime: "",
      guestCount: 0,
      packageName: "",
      includedItems: "",
      paymentMethod: "",
      totalPrice: 0,
      eventType: "",
    },
  });

  const eventTypes = [
    { value: "wedding", label: "Casamento" },
    { value: "graduation", label: "Formatura" },
    { value: "birthday", label: "Aniversário" },
    { value: "corporate", label: "Corporativo" },
    { value: "other", label: "Outro" },
  ];

  const paymentMethods = [
    { value: "cash", label: "À vista" },
    { value: "installments", label: "Parcelado" },
    { value: "card", label: "Cartão" },
    { value: "transfer", label: "Transferência" },
    { value: "pix", label: "PIX" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Contratante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contractorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo do Contratante *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coupleNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Casal *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João & Maria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brideRg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG da Noiva *</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groomRg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG do Noivo *</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
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
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
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
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="exemplo@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractorCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade do Contratante *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite a cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contractorAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Pessoal *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite o endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Evento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário do Evento *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade do Evento *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite a cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Convidados *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Evento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
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
              name="eventAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço do Evento *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite o endereço completo do evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="packageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pacote Escolhido *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pacote Premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
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
                name="totalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Total *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="includedItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Itens Inclusos no Contrato *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Cobertura de 8 horas, 200 fotos editadas, álbum digital..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" size="lg">
            Visualizar Contrato
          </Button>
        </div>
      </form>
    </Form>
  );
}
