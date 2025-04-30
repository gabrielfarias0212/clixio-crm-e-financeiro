
import { Client } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ActionChip } from "./ActionChip";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, MailIcon, PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  client: Client;
  className?: string;
  onClick?: () => void;
}

export function ClientCard({ client, className, onClick }: ClientCardProps) {
  const { name, weddingDate, contractValue, status, nextAction, email, phone } = client;
  
  const formattedValue = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(contractValue);

  const isPotential = status === "orçamento enviado" || status === "follow-up";

  // Ensure we format the date correctly, preserving the day
  const formatWeddingDate = (date: Date | null) => {
    if (!date) return null;
    
    // Create a new date at noon to avoid timezone issues
    const weddingDateObj = new Date(date);
    const localDate = new Date(
      weddingDateObj.getFullYear(),
      weddingDateObj.getMonth(),
      weddingDateObj.getDate(),
      12, 0, 0
    );
    
    return format(localDate, "dd/MM/yyyy");
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md",
        "border border-gray-100 hover:border-gray-200",
        "cursor-pointer animate-scale-in",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-lg">{name}</h3>
            <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
              {weddingDate ? (
                <div className="flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  {formatWeddingDate(weddingDate)}
                </div>
              ) : (
                <div className="text-gray-400 text-xs italic">Data não definida</div>
              )}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center text-sm">
            <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-500" />
            <span className={isPotential ? "text-gray-400 italic" : "font-medium"}>
              {isPotential ? `Potencial: ${formattedValue}` : formattedValue}
            </span>
          </div>
          <ActionChip action={nextAction} />
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div className="flex items-center">
            <MailIcon className="h-3 w-3 mr-1" />
            {email}
          </div>
          <div className="flex items-center">
            <PhoneIcon className="h-3 w-3 mr-1" />
            {phone}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
