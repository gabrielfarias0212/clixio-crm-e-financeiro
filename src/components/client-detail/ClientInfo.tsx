
import { Client } from "@/utils/types";
import { formatDate } from "@/utils/clientUtils";
import { CalendarIcon, Mail, Phone, Users } from "lucide-react";

interface ClientInfoProps {
  client: Client;
}

export function ClientInfo({ client }: ClientInfoProps) {
  // Format wedding date for display
  const weddingDateFormatted = client.weddingDate 
    ? formatDate(client.weddingDate)
    : "Não definida";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Informações de Contato</h2>
      <div className="space-y-3 text-gray-700">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>{client.email || "Não informado"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{client.phone || "Não informado"}</span>
        </div>
        <div className="flex items-start gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500 mt-1" />
          <div>
            <div>{weddingDateFormatted}</div>
          </div>
        </div>
        {client.coupleName && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{client.coupleName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
