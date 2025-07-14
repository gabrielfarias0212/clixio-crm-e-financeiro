
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Calendar, User, Mail, Phone, FileText, CreditCard, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCreateBudget } from '@/hooks/useBudgets';
import { formatCurrency } from '@/utils/currency';
import { BudgetWithItems } from '@/types/budget';

const budgetSchema = z.object({
  client_name: z.string().min(1, 'Nome do cliente é obrigatório'),
  client_email: z.string().email('Email inválido').optional().or(z.literal('')),
  client_phone: z.string().optional(),
  event_date: z.string().optional(),
  budget_title: z.string().min(1, 'Título do orçamento é obrigatório'),
  validity_days: z.number().min(1, 'Validade deve ser maior que 0').default(15),
  payment_method: z.string().optional(),
  payment_conditions: z.string().optional(),
  general_notes: z.string().optional(),
  items: z.array(z.object({
    service_name: z.string().min(1, 'Nome do serviço é obrigatório'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    unit_price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
    unit_type: z.string().optional(),
  })).min(1, 'Adicione pelo menos um item'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  budget?: BudgetWithItems;
  onSubmit?: (data: BudgetFormData) => Promise<void>;
  onSuccess?: (budgetId: string) => void;
  isEditing?: boolean;
}

const unitTypeOptions = [
  { value: 'unitario', label: 'Preço Unitário' },
  { value: 'por_pessoa', label: 'Preço por Pessoa' },
  { value: 'por_pagina', label: 'Preço por Página' },
  { value: 'por_hora', label: 'Preço por Hora' },
  { value: 'por_evento', label: 'Preço por Evento' },
  { value: 'por_foto', label: 'Preço por Foto' },
  { value: 'por_album', label: 'Preço por Álbum' },
  { value: 'taxa_fixa', label: 'Taxa Fixa' },
];

export function BudgetForm({ budget, onSubmit, onSuccess, isEditing = false }: BudgetFormProps) {
  const createBudget = useCreateBudget();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemUnitTypes, setItemUnitTypes] = useState<string[]>([]);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget ? {
      client_name: budget.client_name,
      client_email: budget.client_email || '',
      client_phone: budget.client_phone || '',
      event_date: budget.event_date || '',
      budget_title: budget.budget_title,
      validity_days: budget.validity_days,
      payment_method: budget.payment_method || '',
      payment_conditions: budget.payment_conditions || '',
      general_notes: budget.general_notes || '',
      items: budget.budget_items?.map(item => ({
        service_name: item.service_name,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_type: 'unitario'
      })) || [{ service_name: '', description: '', quantity: 1, unit_price: 0, unit_type: 'unitario' }],
    } : {
      client_name: '',
      budget_title: '',
      validity_days: 15,
      items: [{ service_name: '', description: '', quantity: 1, unit_price: 0, unit_type: 'unitario' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Initialize unit types
  useEffect(() => {
    if (fields.length > 0 && itemUnitTypes.length === 0) {
      setItemUnitTypes(fields.map(() => 'unitario'));
    }
  }, [fields.length, itemUnitTypes.length]);

  const watchedItems = form.watch('items');
  const totalAmount = watchedItems.reduce((total, item) => {
    return total + (item.quantity * item.unit_price);
  }, 0);

  const handleItemUnitTypeChange = (index: number, unitType: string) => {
    const newUnitTypes = [...itemUnitTypes];
    newUnitTypes[index] = unitType;
    setItemUnitTypes(newUnitTypes);
  };

  const handleFormSubmit = async (data: BudgetFormData) => {
    console.log('BudgetForm - onSubmit called with data:', {
      client_name: data.client_name,
      budget_title: data.budget_title,
      items_count: data.items.length,
      total_amount: totalAmount,
      isEditing
    });

    setIsSubmitting(true);
    
    try {
      if (isEditing && onSubmit) {
        await onSubmit(data);
      } else {
        console.log('BudgetForm - calling createBudget mutation...');
        const budgetId = await createBudget.mutateAsync(data as any);
        console.log('BudgetForm - budget created successfully, calling onSuccess...');
        onSuccess?.(budgetId);
      }
    } catch (error) {
      console.error('BudgetForm - error submitting budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewItem = () => {
    append({ service_name: '', description: '', quantity: 1, unit_price: 0, unit_type: 'unitario' });
    setItemUnitTypes([...itemUnitTypes, 'unitario']);
  };

  const removeItem = (index: number) => {
    remove(index);
    const newUnitTypes = [...itemUnitTypes];
    newUnitTypes.splice(index, 1);
    setItemUnitTypes(newUnitTypes);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome completo do cliente" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@exemplo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(11) 99999-9999" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data do Evento
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Budget Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="budget_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Orçamento *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Casamento João e Maria - 2024" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validity_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validade (dias)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="1"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens e Serviços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.service_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Serviço *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Fotografia de Casamento" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Descrição do serviço..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>
                      {unitTypeOptions.find(opt => opt.value === (itemUnitTypes[index] || 'unitario'))?.label || 'Preço Unitário'}
                    </FormLabel>
                    <div className="flex gap-2">
                      <Select
                        value={itemUnitTypes[index] || 'unitario'}
                        onValueChange={(value) => handleItemUnitTypeChange(index, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {unitTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_price`}
                        render={({ field }) => (
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0"
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="flex-1"
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                  </FormItem>

                  <div className="flex items-end">
                    <div className="w-full">
                      <FormLabel>Subtotal</FormLabel>
                      <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                        {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unit_price || 0))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addNewItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>

            <Separator />

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Geral:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Condições de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: PIX, Cartão, Transferência..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições e Parcelamento</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Ex: 50% de entrada + 50% na entrega das fotos"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* General Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Observações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="general_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Informações extras, cláusulas, exclusões de responsabilidade..."
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Orçamento' : 'Criar Orçamento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
