
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { DATE_FORMAT, stringToDate, dateToString } from "@/utils/dates";

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  label?: string;
  description?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  description,
  placeholder = "Selecione uma data",
}: DatePickerProps) {
  // Convert string date to Date object for Calendar component
  const dateValue = stringToDate(value);
  
  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
    } else {
      // Convert Date back to string in DD/MM/YYYY format
      onChange(dateToString(date));
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 px-4 text-left font-normal border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150",
              !value && "text-gray-500"
            )}
          >
            {value ? (
              <span className="text-gray-900">{value}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <CalendarIcon className="ml-auto h-5 w-5 text-gray-400" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-lg border-0 rounded-xl" align="start">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <Calendar
            mode="single"
            selected={dateValue || undefined}
            onSelect={handleDateChange}
            initialFocus
            className="p-3 pointer-events-auto"
            classNames={{
              months: "flex flex-col",
              month: "space-y-3",
              caption: "flex justify-center pt-1 relative items-center mb-2",
              caption_label: "text-sm font-semibold text-gray-900",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md border-0 flex items-center justify-center transition-opacity",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "text-gray-400 w-9 font-normal text-[0.8rem] text-center",
              row: "flex w-full mt-1",
              cell: "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-50 rounded-md",
              day: "h-9 w-9 p-0 font-normal text-sm rounded-md hover:bg-gray-100 transition-colors duration-100 flex items-center justify-center mx-auto aria-selected:opacity-100",
              day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 rounded-md font-medium",
              day_today: "bg-orange-100 text-orange-700 font-semibold border border-orange-200 rounded-md",
              day_outside: "text-gray-300 opacity-50",
              day_disabled: "text-gray-300 opacity-40 cursor-not-allowed",
              day_hidden: "invisible",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FormDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder,
}: {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          {label && <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>}
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
          />
          {description && <FormDescription className="text-xs text-gray-500">{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
