
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabaseUtils";
import { toast } from "sonner";
import { Client, ClientStatus, NextAction, EventCategory } from "@/utils/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Client data from the spreadsheet
const clientsToImport = [
  {
    name: "Dayadria Cypriano Rabelo Seribeli",
    weddingDate: new Date("2025-09-06"),
    location: "Cerimônia: Igreja Matriz / Festa: Simted",
    contractValue: 3800,
    downPayment: 380,
    notes: "10% (380,00) de entrada e restante até o evento"
  },
  {
    name: "LEONARDO GONÇALVES DA SILVA",
    weddingDate: new Date("2026-04-25"),
    location: "CERIMONIA: SANTISSIMA TRINDADE / RECEPÇÃO A DEFINIR",
    contractValue: 3800,
    downPayment: 380,
    notes: "10% (380,00) de entrada até o dia 10 e restante até o dia 26/04/26"
  },
  {
    name: "FRANCIENE DE SOUZA DA SILVA",
    weddingDate: new Date("2025-06-14"),
    location: "NOSSA SENHORA DE FATIMA/ EZENEZER",
    contractValue: 3800,
    downPayment: 380,
    notes: "10% (380,00) de entrada até o dia 10 e restante até o dia 14/06/25"
  },
  {
    name: "Ariene kelita Medina Pereira",
    weddingDate: new Date("2025-11-20"),
    location: "Igreja: palavra profética",
    contractValue: 3000,
    downPayment: 300,
    notes: "ENTRADA DE 10% NO FECHAMENTO DO CONTRATO E RESTANTE ATÉ O DIA 19/11/2025"
  },
  {
    name: "Vanessa Fukuda Mariano",
    weddingDate: new Date("2025-10-05"),
    location: "Garden Fest",
    contractValue: 3800,
    downPayment: 380,
    notes: "10% ENTRADA E RESTANTE ATÉ A DATA DO EVENTO."
  }
];

interface BulkClientImporterProps {
  onComplete: () => void;
}

type UserProfile = {
  id: string;
  email: string;
};

export function BulkClientImporter({ onComplete }: BulkClientImporterProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: clientsToImport.length });
  const [targetUserEmail, setTargetUserEmail] = useState<string>("gabrielfariasfotografias@gmail.com");
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  
  // Find the user ID for the target email
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // Query the profiles table to find the ID for our target user
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', targetUserEmail)
          .single();
        
        if (error) {
          console.error("Error fetching user ID:", error);
          toast.error(`Usuário com email ${targetUserEmail} não encontrado`);
          return;
        }
        
        if (data?.id) {
          setTargetUserId(data.id);
          console.log(`Found user ID for ${targetUserEmail}: ${data.id}`);
        }
      } catch (error) {
        console.error("Error in fetchUserId:", error);
      }
    };
    
    fetchUserId();
  }, [targetUserEmail]);

  const handleImport = async () => {
    if (!targetUserId) {
      toast.error(`Usuário com email ${targetUserEmail} não encontrado. Não é possível importar clientes.`);
      return;
    }
    
    setLoading(true);
    setProgress({ current: 0, total: clientsToImport.length });
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < clientsToImport.length; i++) {
        const clientData = clientsToImport[i];
        
        try {
          // Create a new client
          const newClient = await createClient({
            name: clientData.name,
            email: `client_${i+1}@example.com`, // Placeholder email
            phone: "(00) 00000-0000", // Placeholder phone
            weddingDate: clientData.weddingDate,
            contractValue: clientData.contractValue,
            downPayment: clientData.downPayment,
            status: "fechado" as ClientStatus,
            nextAction: "entregar" as NextAction,
            eventCategory: "Casamento" as EventCategory,
            notes: `${clientData.location}\n${clientData.notes}`
          });
          
          if (newClient) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to create client: ${clientData.name}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error creating client ${clientData.name}:`, error);
        }
        
        setProgress({ current: i + 1, total: clientsToImport.length });
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} clientes importados com sucesso!`);
      }
      
      if (errorCount > 0) {
        toast.error(`Falha ao importar ${errorCount} clientes.`);
      }
      
      onComplete();
    } catch (error) {
      console.error("Error during bulk import:", error);
      toast.error("Erro ao importar clientes. Verifique o console para detalhes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Importar Clientes da Planilha</h3>
        <p className="text-sm text-gray-500">
          Os clientes serão importados para o usuário: <span className="font-medium">{targetUserEmail}</span>
          {!targetUserId && <span className="text-red-500 ml-2">(Usuário não encontrado)</span>}
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleImport} 
          disabled={loading || !targetUserId}
        >
          {loading ? "Importando..." : "Importar Clientes"}
        </Button>
      </div>
      
      {loading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            Importando {progress.current} de {progress.total} clientes...
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="font-medium">Resumo dos clientes a serem importados:</h4>
        <ul className="space-y-1 max-h-60 overflow-y-auto border rounded-md p-2">
          {clientsToImport.map((client, index) => (
            <li key={index} className="text-sm p-2 hover:bg-gray-50 border-b last:border-0">
              <span className="font-medium">{client.name}</span> - 
              {format(client.weddingDate, "dd/MM/yyyy")} - 
              R$ {client.contractValue.toFixed(2)} (Entrada: R$ {client.downPayment.toFixed(2)})
              <p className="text-xs text-gray-500 mt-1">{client.location}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
