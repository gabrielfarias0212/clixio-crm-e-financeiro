
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "@/utils/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthViewProps {
  date: Date;
  clients: Client[];
  onClientClick?: (clientId: string) => void;
}

export function MonthView({ date, clients, onClientClick }: MonthViewProps) {
  // The original calendar view is already implemented in the main Calendar page
  // This component is a placeholder for a more detailed monthly view if needed
  // Currently the existing calendar + upcoming events provide the month view
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">
          Visão Mensal - {format(date, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <p className="text-muted-foreground text-sm">
          Use o calendário lateral para navegar entre os dias e ver os eventos agendados.
        </p>
      </CardContent>
    </Card>
  );
}
