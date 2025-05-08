
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { PaymentFormValues } from "./paymentFormSchema";

export function PaymentNotesField() {
  const form = useFormContext<PaymentFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Observações (opcional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Observações sobre o pagamento"
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
