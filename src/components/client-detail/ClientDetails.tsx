
import { useState } from "react";
import { Client } from "@/utils/types";
import { ClientInfo } from "@/components/client-detail/ClientInfo";
import { FinancialInfo } from "@/components/client-detail/FinancialInfo";
import { ClientNotes } from "@/components/client-detail/ClientNotes";
import { ClientPayments } from "@/components/ClientPayments";
import { ClientMeetingScheduler } from "@/components/client-detail/ClientMeetingScheduler";
import { ClientMeetingsList } from "@/components/client-detail/ClientMeetingsList";

interface ClientDetailsProps {
  client: Client;
  onUpdate?: (updatedClient: Client) => void;
}

export function ClientDetails({ client, onUpdate }: ClientDetailsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMeetingScheduled = () => {
    // Trigger a refresh of the meetings list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Informações gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ClientInfo client={client} />
        <FinancialInfo client={client} />
      </div>
      
      {/* Seção de Reuniões */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Reuniões</h3>
          <ClientMeetingScheduler 
            client={client} 
            onMeetingScheduled={handleMeetingScheduled}
          />
        </div>
        <ClientMeetingsList 
          client={client} 
          refreshTrigger={refreshTrigger}
        />
      </div>
      
      {/* Histórico de Pagamentos */}
      <ClientPayments client={client} onUpdate={onUpdate} />
      
      {/* Notas */}
      <ClientNotes notes={client.notes} />
    </div>
  );
}
