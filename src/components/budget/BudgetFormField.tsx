
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';

interface BudgetFormFieldProps {
  control: Control<any>;
  fieldName: string;
  fieldIndex: number;
  unitType: string;
  onUnitTypeChange: (value: string) => void;
  unitPrice: number;
  onUnitPriceChange: (value: number) => void;
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

export function BudgetFormField({
  control,
  fieldName,
  fieldIndex,
  unitType,
  onUnitTypeChange,
  unitPrice,
  onUnitPriceChange
}: BudgetFormFieldProps) {
  const selectedOption = unitTypeOptions.find(option => option.value === unitType) || unitTypeOptions[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={control}
        name={`${fieldName}.${fieldIndex}.quantity`}
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
        <FormLabel>{selectedOption.label}</FormLabel>
        <div className="flex gap-2">
          <Select value={unitType} onValueChange={onUnitTypeChange}>
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
          <Input 
            type="number" 
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(e) => onUnitPriceChange(parseFloat(e.target.value) || 0)}
            className="flex-1"
          />
        </div>
      </FormItem>

      <FormField
        control={control}
        name={`${fieldName}.${fieldIndex}.unit_price`}
        render={() => (
          <FormItem>
            <FormLabel>Subtotal</FormLabel>
            <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
              {/* Subtotal será calculado automaticamente */}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
