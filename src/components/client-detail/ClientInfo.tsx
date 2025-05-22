
import { Client } from "@/utils/types";
import { CalendarIcon, MapPin, Link, Mail, Phone, Users } from "lucide-react";
import { formatDate } from "@/utils/dates";
import { Button } from "@/components/ui/button";

interface ClientInfoProps {
  client: Client;
}

export function ClientInfo({ client }: ClientInfoProps) {
  // Format wedding date for display
  const weddingDateFormatted = client.weddingDate || "Não definida";
  const preWeddingDateFormatted = client.preWeddingDate 
    ? formatDate(client.preWeddingDate) 
    : null;
    
  // Create WhatsApp link with only numbers
  const getWhatsAppLink = (phone: string) => {
    // Remove any non-numeric characters from the phone number
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Informações de Contato</h2>
      <div className="space-y-3 text-gray-700">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>{client.email || "Não informado"}</span>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{client.phone || "Não informado"}</span>
          </div>
          {client.phone && (
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-green-500 hover:bg-green-600 text-white border-none"
              onClick={() => window.open(getWhatsAppLink(client.phone), '_blank')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="white" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4 mr-1"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
                <path d="M9 10a1 1 0 0 0 1 1c1 0 2.5-2.5 2.5-2.5s1.5 2.5 2.5 2.5 1-1 1-1v3c0 1-1 2-3 2s-3-1-3-2v-3"/>
              </svg>
              WhatsApp
            </Button>
          )}
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
