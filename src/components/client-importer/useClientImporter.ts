
import { useState } from "react";
import { mapClientData } from "./mapClientData";
import { createClient, fetchClients, updateClient } from "@/utils/supabaseUtils";
import { Client } from "@/utils/types";
import { toast } from "sonner";
import { ImportOption, ImportSummary } from "./types";

export function useClientImporter(data: any[]) {
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importOption, setImportOption] = useState<ImportOption>("skip");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const checkForDuplicates = async () => {
    try {
      // Get existing clients
      const existingClients = await fetchClients();
      
      // Map incoming data to client structure
      const mappedClients = data
        .filter(row => Object.keys(row).length > 0)
        .map(row => mapClientData(row));
      
      // Count how many have duplicate emails
      let duplicates = 0;
      
      for (const newClient of mappedClients) {
        if (!newClient.email) continue;
        
        const duplicate = existingClients.find(
          client => client.email === newClient.email
        );
        
        if (duplicate) {
          duplicates++;
        }
      }
      
      return duplicates;
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      return 0;
    }
  };

  const handleStartImport = async () => {
    try {
      // Check for duplicates
      const duplicates = await checkForDuplicates();
      setDuplicateCount(duplicates);
      
      if (duplicates > 0) {
        // Show the confirmation dialog
        setShowConfirmDialog(true);
      } else {
        // No duplicates, proceed with import
        await startImport();
      }
    } catch (error) {
      console.error("Error during import preparation:", error);
      toast.error("Erro ao preparar a importação");
    }
  };

  const startImport = async () => {
    setImporting(true);
    setShowConfirmDialog(false);
    
    try {
      // Get existing clients
      const existingClients = await fetchClients();
      
      // Initialize counters for summary
      let total = 0;
      let added = 0;
      let updated = 0;
      let skipped = 0;
      let errors = 0;
      
      // Map incoming data to client structure and filter out empty rows
      const mappedClients = data
        .filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== ""))
        .map(row => mapClientData(row));
      
      total = mappedClients.length;
      
      // Process each client
      for (const clientData of mappedClients) {
        try {
          // Check if this client already exists (by email)
          const existingClient = clientData.email 
            ? existingClients.find(c => c.email === clientData.email)
            : null;
          
          if (existingClient) {
            // Handling based on the selected import option
            if (importOption === "skip") {
              // Skip this client
              skipped++;
              continue;
            } else if (importOption === "update") {
              // Update the existing client
              const result = await updateClient(existingClient.id, clientData);
              if (result) {
                updated++;
              } else {
                errors++;
              }
              continue;
            }
            // For "replace", we'll just add new clients and ignore duplicates
          }
          
          // Add as a new client
          const result = await createClient(clientData as Omit<Client, "id" | "createdAt" | "updatedAt" | "payments">);
          if (result) {
            added++;
          } else {
            errors++;
          }
          
        } catch (error) {
          console.error("Error importing client:", error);
          errors++;
        }
      }
      
      // Update the summary
      setSummary({
        total,
        added,
        updated,
        skipped,
        errors
      });
      
      // Show toast with results
      toast.success(`Importação concluída: ${added} adicionados, ${updated} atualizados`);
      
    } catch (error) {
      console.error("Error during import:", error);
      toast.error("Erro durante a importação");
    } finally {
      setImporting(false);
    }
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
