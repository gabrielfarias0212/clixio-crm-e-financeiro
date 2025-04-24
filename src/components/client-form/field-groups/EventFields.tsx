
import { Control } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClientFormValues } from "../types";
import { EVENT_CATEGORIES } from "../constants";

interface EventFieldsProps {
  control: Control<ClientFormValues>;
}

export function EventFields({ control }: EventFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="weddingDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data do Evento</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              Deixe em branco se ainda não estiver definida
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="eventCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria do Evento</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria do evento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EVENT_CATEGORIES.map((ec) => (
                  <SelectItem key={ec} value={ec}>
                    {ec.charAt(0).toUpperCase() + ec.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
