
import { Client } from "@/utils/types";
import { ClientInfo } from "@/components/client-detail/ClientInfo";
import { FinancialInfo } from "@/components/client-detail/FinancialInfo";
import { ClientNotes } from "@/components/client-detail/ClientNotes";
import { ClientPayments } from "@/components/ClientPayments";
import { ClientContractForm } from "@/components/client-detail/ClientContractForm";

interface ClientDetailsProps {
  client: Client;
  onUpdate?: (client: Client) => void;
}

export function ClientDetails({ client, onUpdate }: ClientDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Formulário de Contrato */}
      <ClientContractForm client={client} />
      
      {/* Informações gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ClientInfo client={client} />
        <FinancialInfo client={client} />
      </div>
      
      {/* Histórico de Pagamentos */}
      <ClientPayments client={client} onUpdate={onUpdate} />
      
      {/* Notas */}
      <ClientNotes notes={client.notes} />
    </div>
  );
}
