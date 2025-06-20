
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthFilterProps {
  selectedMonth: string;
  selectedYear: number;
  onMonthChange: (month: string, year: number) => void;
}

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" }
];

export function MonthFilter({ selectedMonth, selectedYear, onMonthChange }: MonthFilterProps) {
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = currentDate.getFullYear();

  const handlePreviousMonth = () => {
    const monthNum = parseInt(selectedMonth);
    if (monthNum === 1) {
      onMonthChange("12", selectedYear - 1);
    } else {
      onMonthChange(String(monthNum - 1).padStart(2, '0'), selectedYear);
    }
  };

  const handleNextMonth = () => {
    const monthNum = parseInt(selectedMonth);
    if (monthNum === 12) {
      onMonthChange("01", selectedYear + 1);
    } else {
      onMonthChange(String(monthNum + 1).padStart(2, '0'), selectedYear);
    }
  };

  const handleCurrentMonth = () => {
    onMonthChange(currentMonth, currentYear);
  };

  const selectedMonthName = MONTHS.find(m => m.value === selectedMonth)?.label || "";

  return (
    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-600" />
        <span className="font-medium text-gray-700">Filtrar por período:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={(month) => onMonthChange(month, selectedYear)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={String(selectedYear)} onValueChange={(year) => onMonthChange(selectedMonth, parseInt(year))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCurrentMonth}
        className="text-blue-600 hover:text-blue-700"
      >
        Mês Atual
      </Button>
      
      <div className="ml-auto text-sm text-gray-600 font-medium">
        {selectedMonthName} {selectedYear}
      </div>
    </div>
  );
}
