
import { Client } from "@/utils/types";
import { CalendarIcon, MapPin, Link, Clock, Mail, Phone, Users } from "lucide-react";
import { formatDate } from "@/utils/dates";

interface ClientInfoProps {
  client: Client;
}

export function ClientInfo({ client }: ClientInfoProps) {
  // Format wedding date for display
  const weddingDateFormatted = client.weddingDate || "Não definida";
  const preWeddingDateFormatted = client.preWeddingDate 
    ? formatDate(client.preWeddingDate) 
    : null;

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
            {client.weddingStartTime && (
              <div className="text-sm text-gray-500">
                {client.weddingStartTime} {client.weddingEndTime ? `- ${client.weddingEndTime}` : ''}
              </div>
            )}
          </div>
        </div>
        {client.coupleName && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{client.coupleName}</span>
          </div>
        )}
        
        {/* Novas informações do contrato */}
        {client.eventLocation && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-1" />
            <span>{client.eventLocation}</span>
          </div>
        )}
        
        {preWeddingDateFormatted && (
          <div className="flex items-start gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-500 mt-1" />
            <div>
              <div>Pré-Wedding: {preWeddingDateFormatted}</div>
              {client.preWeddingStartTime && (
                <div className="text-sm text-gray-500">
                  {client.preWeddingStartTime} {client.preWeddingEndTime ? `- ${client.preWeddingEndTime}` : ''}
                </div>
              )}
            </div>
          </div>
        )}
        
        {client.contractLink && (
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-gray-500" />
            <a 
              href={client.contractLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Acessar contrato
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
