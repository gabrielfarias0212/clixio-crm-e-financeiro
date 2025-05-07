
import { useState } from "react";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { mapImportedClientToModel } from "./mapClientData";

export function useClientImporter(data: any[]) {
  const { addClient } = useClients();
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<{
    total: number;
    added: number;
    updated: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importOption, setImportOption] = useState<"skip" | "update">("skip");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Check for potential duplicates based on email
  const checkForDuplicates = () => {
    // For this example, we'll just set a random number
    // In a real implementation, this would check against existing clients
    setDuplicateCount(Math.floor(Math.random() * data.length));
    if (duplicateCount > 0) {
      setShowConfirmDialog(true);
    } else {
      startImport();
    }
  };

  const handleStartImport = () => {
    checkForDuplicates();
  };
  
  const startImport = async () => {
    setImporting(true);
    
    const results = {
      total: data.length,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    try {
      for (const item of data) {
        try {
          const mappedClient = mapImportedClientToModel(item);
          
          // Basic validation - require name and email
          if (!mappedClient.name || !mappedClient.email) {
            results.skipped += 1;
            continue;
          }
          
          // Add the client (in a real implementation, we would check for duplicates here)
          const result = await addClient(mappedClient);
          
          if (result) {
            results.added += 1;
          } else {
            results.errors += 1;
          }
        } catch (error) {
          console.error("Error importing client:", error);
          results.errors += 1;
        }
      }
      
      setSummary(results);
      
      if (results.errors > 0) {
        toast.error(`Import completed with ${results.errors} errors.`);
      } else {
        toast.success("Clients imported successfully!");
      }
    } catch (error) {
      console.error("Error during import:", error);
      toast.error("Error during import process.");
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
