
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ProductSale, ProductType, Client } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

interface ProductSaleFormProps {
  onSubmit: (data: Omit<ProductSale, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  clients: Client[];
  isLoading?: boolean;
  initialData?: Partial<ProductSale>;
}

interface FormData {
  client_id?: string;
  product_name: string;
  product_type: ProductType;
  description?: string;
  quantity: number;
  unit_price: number;
  delivery_date?: Date;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes?: string;
}

const productTypes: { value: ProductType; label: string }[] = [
  { value: 'album', label: 'Álbum' },
  { value: 'moldura', label: 'Moldura' },
  { value: 'ensaio', label: 'Ensaio' },
  { value: 'pacote', label: 'Pacote' },
  { value: 'outros', label: 'Outros' },
];

const paymentMethods = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'parcelado', label: 'Parcelado' },
];

export function ProductSaleForm({ onSubmit, clients, isLoading, initialData }: ProductSaleFormProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    initialData?.client_id ? clients.find(c => c.id === initialData.client_id) || null : null
  );
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    initialData?.delivery_date ? new Date(initialData.delivery_date) : undefined
  );
  const [openClientSearch, setOpenClientSearch] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      client_id: initialData?.client_id || '',
      product_name: initialData?.product_name || '',
      product_type: initialData?.product_type || 'album',
      description: initialData?.description || '',
      quantity: initialData?.quantity || 1,
      unit_price: initialData?.unit_price || 0,
      payment_method: initialData?.payment_method || 'pix',
      payment_status: initialData?.payment_status || 'pendente',
      order_status: initialData?.order_status || 'pedido',
      notes: initialData?.notes || '',
    }
  });

  const quantity = watch('quantity', 1);
  const unitPrice = watch('unit_price', 0);
  const totalAmount = quantity * unitPrice;

  const handleFormSubmit = (data: FormData) => {
    const formattedData = {
      ...data,
      client_id: selectedClient?.id,
      total_amount: totalAmount,
      delivery_date: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : undefined,
    };

    onSubmit(formattedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar Venda de Produto' : 'Nova Venda de Produto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Cliente (Opcional) */}
          <div className="space-y-2">
            <Label>Cliente (Opcional)</Label>
            <Popover open={openClientSearch} onOpenChange={setOpenClientSearch}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedClient ? selectedClient.name : "Selecionar cliente..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedClient(null);
                        setValue('client_id', '');
                        setOpenClientSearch(false);
                      }}
                    >
                      Venda sem cliente
                    </CommandItem>
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        onSelect={() => {
                          setSelectedClient(client);
                          setValue('client_id', client.id);
                          setOpenClientSearch(false);
                        }}
                      >
                        {client.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label htmlFor="product_name">Nome do Produto *</Label>
              <Input
                id="product_name"
                {...register('product_name', { required: 'Nome do produto é obrigatório' })}
                placeholder="Ex: Álbum Premium 30x30"
              />
              {errors.product_name && (
                <p className="text-sm text-red-500">{errors.product_name.message}</p>
              )}
            </div>

            {/* Tipo do Produto */}
            <div className="space-y-2">
              <Label>Tipo do Produto *</Label>
              <Select
                value={watch('product_type')}
                onValueChange={(value) => setValue('product_type', value as ProductType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detalhes adicionais do produto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity', { 
                  required: 'Quantidade é obrigatória',
                  min: { value: 1, message: 'Quantidade deve ser pelo menos 1' }
                })}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            {/* Valor Unitário */}
            <div className="space-y-2">
              <Label htmlFor="unit_price">Valor Unitário (R$) *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                {...register('unit_price', { 
                  required: 'Valor unitário é obrigatório',
                  min: { value: 0, message: 'Valor deve ser positivo' }
                })}
              />
              {errors.unit_price && (
                <p className="text-sm text-red-500">{errors.unit_price.message}</p>
              )}
            </div>

            {/* Valor Total */}
            <div className="space-y-2">
              <Label>Valor Total (R$)</Label>
              <Input
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalAmount)}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data de Entrega */}
            <div className="space-y-2">
              <Label>Data de Entrega</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? 
                      format(deliveryDate, "dd/MM/yyyy", { locale: ptBR }) : 
                      "Selecionar data"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label>Forma de Pagamento *</Label>
              <Select
                value={watch('payment_method')}
                onValueChange={(value) => setValue('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status do Pagamento */}
            <div className="space-y-2">
              <Label>Status do Pagamento</Label>
              <Select
                value={watch('payment_status')}
                onValueChange={(value) => setValue('payment_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status do Pedido */}
            <div className="space-y-2">
              <Label>Status do Pedido</Label>
              <Select
                value={watch('order_status')}
                onValueChange={(value) => setValue('order_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pedido">Pedido</SelectItem>
                  <SelectItem value="producao">Em Produção</SelectItem>
                  <SelectItem value="pronto">Pronto</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Venda'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
