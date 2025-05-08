
import { useState, useEffect } from "react";
import { Client, TransactionCategory, TransactionType } from "@/utils/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema, TransactionFormValues } from "./schema";
import { fetchFinancialCategories } from "@/utils/supabaseUtils";
import { toast } from "sonner";
import { dateToString } from "@/utils/dateUtils";

// Default categories
const DEFAULT_INCOME_CATEGORIES: TransactionCategory[] = [
  "pagamento de cliente", 
  "outras receitas",
  "casamento", 
  "casamento civil", 
  "aniversario", 
  "evento corporativo", 
  "ensaio externo", 
  "ensaio estudio", 
  "ensaio corporativo"
];

const DEFAULT_EXPENSE_CATEGORIES: TransactionCategory[] = [
  "despesa operacional", 
  "material", 
  "serviço terceirizado", 
  "imposto", 
  "outras despesas",
  "casamento", 
  "casamento civil", 
  "aniversario", 
  "evento corporativo", 
  "ensaio externo", 
  "ensaio estudio", 
  "ensaio corporativo"
];

export function useTransactionForm(
  onSubmit: (data: TransactionFormValues) => void,
  onCancel: () => void
) {
  const [transactionType, setTransactionType] = useState<TransactionType>("entrada");
  const [financialCategories, setFinancialCategories] = useState<TransactionCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "entrada",
      category: "pagamento de cliente",
      amount: undefined,
      date: dateToString(new Date()),
      description: "",
      clientId: undefined,
    },
  });

  // Update the client field when transaction type changes
  useEffect(() => {
    if (transactionType === "entrada") {
      form.setValue("category", "pagamento de cliente");
    } else {
      // For expense transactions, clear client selection if "none" isn't an option
      const currentClientId = form.getValues("clientId");
      if (currentClientId === "none" || !currentClientId) {
        form.setValue("clientId", undefined);
      }
    }
  }, [transactionType, form]);

  // Load categories when transaction type changes
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Fetch categories from database
        const cats = await fetchFinancialCategories();
        
        // Filter by type (income/expense)
        const filteredCats = cats
          .filter(cat => cat.type === transactionType)
          .map(cat => cat.name);
        
        // Combine default and database categories
        const defaultCats = transactionType === "entrada" 
          ? DEFAULT_INCOME_CATEGORIES
          : DEFAULT_EXPENSE_CATEGORIES;
        
        // Combine categories without duplicates
        const combinedCats = [...new Set([...defaultCats, ...filteredCats])];
        
        setFinancialCategories(combinedCats);
        
        // Reset selected category to first option
        if (combinedCats.length > 0) {
          form.setValue("category", combinedCats[0]);
        }
        
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toast.error("Não foi possível carregar as categorias");
      }
    };
    
    loadCategories();
  }, [transactionType, form]);

  const handleSubmit = (data: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      // Don't include clientId if "none" is selected
      if (data.clientId === "none") {
        data.clientId = undefined;
      }
      
      onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    transactionType,
    setTransactionType,
    financialCategories,
    isSubmitting,
    handleSubmit,
    handleCancel: onCancel
  };
}
