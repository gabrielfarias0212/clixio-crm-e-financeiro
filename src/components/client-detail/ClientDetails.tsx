
import { Client } from "@/utils/types";
import { ClientInfo } from "./ClientInfo";
import { ClientNotes } from "./ClientNotes";
import { FinancialInfo } from "./FinancialInfo";
import { DeliveryWorkflow } from "./DeliveryWorkflow";
import { ClientProductSales } from "./ClientProductSales";

interface ClientDetailsProps {
  client: Client;
  onUpdate: (clientId: string, data: Partial<Client>) => void;
}

export function ClientDetails({ client, onUpdate }: ClientDetailsProps) {
  return (
    <div className="space-y-6">
      <ClientInfo client={client} onUpdate={onUpdate} />
      <DeliveryWorkflow client={client} onUpdate={onUpdate} />
      <FinancialInfo client={client} />
      <ClientProductSales client={client} />
      <ClientNotes client={client} onUpdate={onUpdate} />
    </div>
  );
}
