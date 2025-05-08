
import React from "react";
import { Client, Transaction } from "@/utils/types";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TypeSelector } from "./transaction-form/TypeSelector";
import { CategorySelector } from "./transaction-form/CategorySelector";
import { DateSelector } from "./transaction-form/DateSelector";
import { ClientSelector } from "./transaction-form/ClientSelector";
import { useTransactionForm } from "./transaction-form/useTransactionForm";

interface AddTransactionFormProps {
  clients: Client[];
  onAddTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export function AddTransactionForm({ 
  clients, 
  onAddTransaction, 
  onCancel 
}: AddTransactionFormProps) {
  const { 
    form,
    transactionType,
    setTransactionType,
    financialCategories,
    isSubmitting,
    handleSubmit,
    handleCancel
  } = useTransactionForm(onAddTransaction, onCancel);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transaction Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <TypeSelector 
                value={field.value} 
                onChange={(value) => {
                  field.onChange(value);
                  setTransactionType(value);
                }}
              />
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <CategorySelector 
                categories={financialCategories}
                value={field.value}
                onChange={field.onChange}
                transactionType={transactionType}
              />
            )}
          />

          {/* Amount */}
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

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <DateSelector 
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {/* Client */}
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <ClientSelector 
                clients={clients}
                transactionType={transactionType}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {/* Description */}
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
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Registrar Transação
          </Button>
        </div>
      </form>
    </Form>
  );
}
