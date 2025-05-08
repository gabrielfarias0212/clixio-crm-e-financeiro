
import React from "react";
import { TransactionType } from "@/utils/types";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TypeSelectorProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <FormItem>
      <FormLabel>Tipo de Transação</FormLabel>
      <Select
        onValueChange={(value: TransactionType) => onChange(value)}
        value={value}
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
  );
}
