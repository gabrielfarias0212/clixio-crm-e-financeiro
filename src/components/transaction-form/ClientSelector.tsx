
import React from "react";
import { Client, TransactionType } from "@/utils/types";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientSelectorProps {
  clients: Client[];
  transactionType: TransactionType;
  value: string | undefined;
  onChange: (value: string) => void;
}

export function ClientSelector({ 
  clients, 
  transactionType, 
  value, 
  onChange 
}: ClientSelectorProps) {
  return (
    <FormItem>
      <FormLabel>Cliente {transactionType === "saída" && "(opcional)"}</FormLabel>
      <Select 
        onValueChange={onChange} 
        value={value}
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
  );
}
