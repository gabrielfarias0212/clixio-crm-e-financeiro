
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ClientFormValues } from "../types";

interface PaymentFieldsProps {
  control: Control<ClientFormValues>;
  watchStatus: string;
}

export function PaymentFields({ control, watchStatus }: PaymentFieldsProps) {
  // Helper function to parse string to number
  const handleNumberInput = (value: string, onChange: (val: number) => void) => {
    // Remove any non-numeric characters except decimal point
    const cleanedValue = value.replace(/[^\d.]/g, '');
    
    // Convert to number or set to 0 if empty/invalid
    const numValue = cleanedValue ? parseFloat(cleanedValue) : 0;
    
    // Call the original onChange with the numeric value
    onChange(numValue);
  };

  return (
    <>
      <FormField
        control={control}
        name="contractValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor do Contrato/Potencial</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <Input 
                  type="text" 
                  placeholder="0,00"
                  value={field.value === 0 ? "" : field.value} 
                  onChange={(e) => handleNumberInput(e.target.value, field.onChange)}
                  onBlur={field.onBlur}
                  className="pl-8 focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="downPayment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor de Entrada</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <Input 
                  type="text" 
                  placeholder="0,00"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => handleNumberInput(e.target.value, field.onChange)}
                  onBlur={field.onBlur}
                  className="pl-8 focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
                  disabled={watchStatus === "orçamento enviado" || watchStatus === "follow-up"}
                />
              </div>
            </FormControl>
            {watchStatus === "orçamento enviado" || watchStatus === "follow-up" ? (
              <FormDescription>
                Disponível apenas para contratos fechados
              </FormDescription>
            ) : (
              <FormDescription>
                Valor da entrada inicial (será registrado como primeiro pagamento)
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
