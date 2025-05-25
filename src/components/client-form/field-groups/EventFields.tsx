
import { Control, useWatch } from "react-hook-form";
import { ClientFormValues } from "../types";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { useClientCalendarIntegration } from "@/hooks/useClientCalendarIntegration";
import { Client } from "@/utils/types";

interface EventFieldsProps {
  control: Control<ClientFormValues>;
  watchHasPreWedding: boolean;
  client?: Client;
}

export function EventFields({ control, watchHasPreWedding, client }: EventFieldsProps) {
  const { syncPreWeddingEvent } = useClientCalendarIntegration();
  
  // Watch for changes in pre-wedding fields
  const preWeddingDate = useWatch({ control, name: "preWeddingDate" });
  const preWeddingStartTime = useWatch({ control, name: "preWeddingStartTime" });
  const preWeddingEndTime = useWatch({ control, name: "preWeddingEndTime" });
  const hasPreWedding = useWatch({ control, name: "hasPreWedding" });

  // Sync pre-wedding event with calendar when data changes
  useEffect(() => {
    if (client && hasPreWedding) {
      syncPreWeddingEvent(
        client,
        preWeddingDate,
        preWeddingStartTime,
        preWeddingEndTime
      );
    } else if (client && !hasPreWedding) {
      // Remove event if pre-wedding is disabled
      syncPreWeddingEvent(client, null);
    }
  }, [client, hasPreWedding, preWeddingDate, preWeddingStartTime, preWeddingEndTime, syncPreWeddingEvent]);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Informações do Evento</h3>
      
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
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Pré-Wedding / Ensaio</h4>
          
          <FormField
            control={control}
            name="hasPreWedding"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal cursor-pointer">
                  Este cliente precisa de pré-wedding/ensaio
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        
        {watchHasPreWedding && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="preWeddingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Data do Pré-Wedding
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        📅 Sincroniza com calendário
                      </span>
                    </FormLabel>
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
            
            {preWeddingDate && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-medium">✅ Evento criado no calendário</p>
                <p>O pré-wedding foi automaticamente adicionado ao seu calendário para o dia {preWeddingDate}.</p>
              </div>
            )}
          </>
        )}
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
