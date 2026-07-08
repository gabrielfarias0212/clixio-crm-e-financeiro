import { Control, useWatch } from "react-hook-form";
import { ClientFormValues } from "../types";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { usePreWeddingCalendarSync } from "@/hooks/usePreWeddingCalendarSync";

interface EventFieldsProps {
  control: Control<ClientFormValues>;
  watchHasPreWedding: boolean;
  clientId?: string;
}

export function EventFields({ control, watchHasPreWedding, clientId }: EventFieldsProps) {
  const clientName = useWatch({ control, name: "name" }) || "";
  const preWeddingDate = useWatch({ control, name: "preWeddingDate" });
  const preWeddingStartTime = useWatch({ control, name: "preWeddingStartTime" });
  const preWeddingEndTime = useWatch({ control, name: "preWeddingEndTime" });

  // Mantém sync com o calendário (lê valores do contexto do form, independente de onde os campos estão renderizados)
  usePreWeddingCalendarSync({
    clientId,
    clientName,
    preWeddingDate,
    preWeddingStartTime,
    preWeddingEndTime,
    hasPreWedding: watchHasPreWedding,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="weddingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do evento</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione uma data"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="weddingStartTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Início</FormLabel>
              <FormControl>
                <Input type="time" {...field} placeholder="Hora início" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="weddingEndTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Término</FormLabel>
              <FormControl>
                <Input type="time" {...field} placeholder="Hora término" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="eventLocation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Local do evento</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Digite o local do evento" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
