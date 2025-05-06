
import { format } from "date-fns";
import { ClientToImport } from "@/data/sampleClientData";

interface ClientImportSummaryProps {
  clients: ClientToImport[];
}

export function ClientImportSummary({ clients }: ClientImportSummaryProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Resumo dos clientes a serem importados:</h4>
      <ul className="space-y-1 max-h-60 overflow-y-auto border rounded-md p-2">
        {clients.map((client, index) => (
          <li key={index} className="text-sm p-2 hover:bg-gray-50 border-b last:border-0">
            <span className="font-medium">{client.name}</span> - 
            {format(client.weddingDate, "dd/MM/yyyy")} - 
            R$ {client.contractValue.toFixed(2)} (Entrada: R$ {client.downPayment.toFixed(2)})
            <p className="text-xs text-gray-500 mt-1">{client.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
