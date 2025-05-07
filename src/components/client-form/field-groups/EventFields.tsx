import { Control } from "react-hook-form";
import { ClientFormValues } from "../types";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { EventCategoryField } from "./EventCategoryField";
import { Input } from "@/components/ui/input";
import { createValidDate } from "@/utils/dateUtils";

interface EventFieldsProps {
  control: Control<ClientFormValues>;
}

export function EventFields({ control }: EventFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Informações do Evento</h3>
      
      <EventCategoryField control={control} />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="weddingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Evento</FormLabel>
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
              <FormLabel>Horário Início</FormLabel>
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
              <FormLabel>Horário Término</FormLabel>
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
            <FormLabel>Local do Evento</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Digite o local do evento" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="preWeddingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Pré-Wedding (opcional)</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione uma data (opcional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="preWeddingStartTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário Início</FormLabel>
              <FormControl>
                <Input type="time" {...field} placeholder="Hora início" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="preWeddingEndTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário Término</FormLabel>
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
        name="contractLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link do Contrato (opcional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Cole o link do contrato (Google Drive, etc)" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
