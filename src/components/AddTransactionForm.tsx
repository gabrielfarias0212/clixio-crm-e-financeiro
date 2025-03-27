
import { useState, useEffect } from "react";
import { Client, Transaction, TransactionCategory, TransactionType } from "@/utils/types";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Income categories
const incomeCategories: TransactionCategory[] = [
  "pagamento de cliente",
  "outras receitas",
];

// Expense categories
const expenseCategories: TransactionCategory[] = [
  "despesa operacional",
  "material",
  "serviço terceirizado",
  "imposto",
  "outras despesas",
];

const transactionFormSchema = z.object({
  type: z.enum(["entrada", "saída"]),
  category: z.string(),
  amount: z.coerce.number().positive({ message: "O valor deve ser maior que zero" }),
  date: z.date(),
  description: z.string().min(3, { message: "A descrição deve ter pelo menos 3 caracteres" }),
  clientId: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface AddTransactionFormProps {
  clients: Client[];
  onAddTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export function AddTransactionForm({ clients, onAddTransaction, onCancel }: AddTransactionFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>("entrada");
  const [availableCategories, setAvailableCategories] = useState<TransactionCategory[]>(incomeCategories);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "entrada",
      category: "pagamento de cliente",
      amount: undefined,
      date: new Date(),
      description: "",
      clientId: undefined,
    },
  });

  // Update available categories when transaction type changes
  useEffect(() => {
    setAvailableCategories(transactionType === "entrada" ? incomeCategories : expenseCategories);
    
    // Reset category when type changes
    form.setValue("category", 
      transactionType === "entrada" ? "pagamento de cliente" : "despesa operacional"
    );
  }, [transactionType, form]);

  const handleSubmit = (data: TransactionFormValues) => {
    onAddTransaction({
      type: data.type, // Ensure this is included and not marked as optional
      category: data.category as TransactionCategory,
      amount: data.amount,
      date: data.date,
      description: data.description,
      clientId: data.clientId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Transação</FormLabel>
                <Select
                  onValueChange={(value: TransactionType) => {
                    field.onChange(value);
                    setTransactionType(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de transação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saída">Saída</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCategories.map((category) => (
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input 
                      type="number" 
                      placeholder="0,00" 
                      {...field} 
                      className="pl-8"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
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
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente {transactionType === "saída" && "(opcional)"}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        transactionType === "entrada" 
                          ? "Selecione o cliente" 
                          : "Selecione o cliente (opcional)"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transactionType === "saída" && (
                      <SelectItem value="none">Nenhum cliente</SelectItem>
                    )}
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
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
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva a transação"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Registrar Transação
          </Button>
        </div>
      </form>
    </Form>
  );
}
