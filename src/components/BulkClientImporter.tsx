
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClientStatus, NextAction, EventCategory } from "@/utils/types";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@/utils/supabaseUtils";
import { clientsToImport } from "@/data/sampleClientData";
import { ImportProgress } from "@/components/bulk-import/ImportProgress";
import { ImportControls } from "@/components/bulk-import/ImportControls";
import { ClientImportSummary } from "@/components/bulk-import/ClientImportSummary";

interface BulkClientImporterProps {
  onComplete: () => void;
}

export function BulkClientImporter({ onComplete }: BulkClientImporterProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: clientsToImport.length });
  
  // Using a constant instead of state to avoid excessive type instantiation
  const targetUserEmail = "gabrielfariasfotografias@gmail.com";
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
      
      <ImportControls 
        onImport={handleImport}
        isLoading={loading}
        isDisabled={!targetUserId}
      />
      
      <ImportProgress 
        current={progress.current}
        total={progress.total}
        isVisible={loading}
      />
      
      <ClientImportSummary clients={clientsToImport} />
    </div>
  );
}
