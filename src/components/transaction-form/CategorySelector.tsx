
import React, { useState } from "react";
import { TransactionType } from "@/utils/types";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createFinancialCategory } from "@/utils/supabaseUtils";

interface CategorySelectorProps {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  transactionType: TransactionType;
}

export function CategorySelector({ 
  categories, 
  value, 
  onChange,
  transactionType
}: CategorySelectorProps) {
  const [addingCategory, setAddingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('O nome da categoria não pode ser vazio.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createFinancialCategory({
        name: newCategoryName,
        type: transactionType,
      });
      
      if (result) {
        toast.success('Categoria criada com sucesso!');
        setNewCategoryName('');
        setAddingCategory(false);
        
        // Select the new category
        onChange(result.name);
      } else {
        toast.error('Erro ao criar categoria. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Falha ao criar nova categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormItem>
      <FormLabel>Categoria</FormLabel>
      <div className="flex gap-2 items-center">
        <Select onValueChange={onChange} value={value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setAddingCategory((prev) => !prev)}
          title="Criar nova categoria"
        >
          +
        </Button>
      </div>
      {addingCategory && (
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Nova categoria"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-48"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCategory}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
}
