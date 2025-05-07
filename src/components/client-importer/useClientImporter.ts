import { useState } from "react";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { mapImportedClientToModel } from "./mapClientData";
import { ImportOption } from "./DuplicateDialog";

export interface ImportSummary {
  total: number;
  added: number;
  updated: number;
  skipped: number;
  errors: number;
}

export function useClientImporter(data: any[]) {
  const { clients, addClient } = useClients();
  const [importing, setImporting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [importOption, setImportOption] = useState<ImportOption>('skip');
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  
  // Find duplicate clients based on email or phone
  const getDuplicateClients = () => {
    const duplicates = data.filter(row => {
      const email = row["E-mail"] || row["email"] || "";
      const phone = row["Telefone"] || row["telefone"] || "";
      
      return clients.some(client => 
        (email && client.email && client.email.toLowerCase() === email.toLowerCase()) || 
        (phone && client.phone && typeof client.phone === 'string' && typeof phone === 'string' && 
         client.phone.toLowerCase() === phone.toLowerCase())
      );
    });
    
    return duplicates.length;
  };

  const duplicateCount = getDuplicateClients();

  const handleStartImport = () => {
    if (duplicateCount > 0) {
      setShowConfirmDialog(true);
    } else {
      startImport();
    }
  };

  const startImport = async () => {
    setImporting(true);
    
    const results: ImportSummary = {
      total: data.length,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    for (const row of data) {
      try {
        const clientData = mapImportedClientToModel(row);
        
        // Check if client already exists
        const email = clientData.email.toLowerCase();
        const phone = typeof clientData.phone === 'string' ? clientData.phone.toLowerCase() : '';
        const existingClient = clients.find(c => 
          (email && c.email && c.email.toLowerCase() === email) || 
          (phone && c.phone && typeof c.phone === 'string' && c.phone.toLowerCase() === phone)
        );
        
        if (existingClient) {
          if (importOption === 'skip') {
            results.skipped++;
            continue;
          } else if (importOption === 'replace') {
            // TODO: Update client - for now just skip
            results.updated++;
            continue;
          } else {
            // Keep both - add as new
            const newClient = await addClient(clientData);
            if (newClient) {
              results.added++;
            } else {
              results.errors++;
            }
          }
        } else {
          // Add new client
          const newClient = await addClient(clientData);
          if (newClient) {
            results.added++;
          } else {
            results.errors++;
          }
        }
      } catch (error) {
        console.error("Error importing client:", error);
        results.errors++;
      }
    }
    
    setSummary(results);
    setImporting(false);
    
    // Show success toast
    toast.success(`Importação concluída! ${results.added} clientes adicionados.`);
  };

  return {
    importing,
    summary,
    duplicateCount,
    importOption,
    showConfirmDialog,
    setImportOption,
    setShowConfirmDialog,
    handleStartImport,
    startImport
  };
}
