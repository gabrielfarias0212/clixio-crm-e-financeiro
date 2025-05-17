
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
      // Obter clientes existentes
      const existingClients = await fetchClients();
      
      // Mapear os dados de entrada para a estrutura de cliente
      const mappedClients = data
        .filter(row => Object.keys(row).length > 0)
        .map(row => mapClientData(row));
      
      // Contar quantos têm e-mails duplicados
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
      console.error("Erro ao verificar duplicatas:", error);
      return 0;
    }
  };

  const handleStartImport = async () => {
    try {
      // Verificar duplicatas
      const duplicates = await checkForDuplicates();
      setDuplicateCount(duplicates);
      
      if (duplicates > 0) {
        // Mostrar o diálogo de confirmação
        setShowConfirmDialog(true);
      } else {
        // Sem duplicatas, prosseguir com a importação
        await startImport();
      }
    } catch (error) {
      console.error("Erro durante a preparação da importação:", error);
      toast.error("Erro ao preparar a importação");
    }
  };

  const startImport = async () => {
    setImporting(true);
    setShowConfirmDialog(false);
    
    try {
      // Obter clientes existentes
      const existingClients = await fetchClients();
      
      // Inicializar contadores para o resumo
      let total = 0;
      let added = 0;
      let updated = 0;
      let skipped = 0;
      let errors = 0;
      
      // Mapear os dados de entrada para a estrutura de cliente e filtrar linhas vazias
      const mappedClients = data
        .filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== ""))
        .map(row => mapClientData(row));
      
      total = mappedClients.length;
      
      if (total === 0) {
        toast.error("Nenhum dado válido para importar");
        setImporting(false);
        return;
      }
      
      console.log(`Iniciando importação de ${total} clientes`);
      
      // Processar cada cliente
      for (const clientData of mappedClients) {
        try {
          // Verificar se este cliente já existe (pelo e-mail)
          const existingClient = clientData.email 
            ? existingClients.find(c => c.email === clientData.email)
            : null;
          
          if (existingClient) {
            // Manipulação com base na opção de importação selecionada
            if (importOption === "skip") {
              // Pular este cliente
              console.log(`Pulando cliente: ${clientData.name} (${clientData.email})`);
              skipped++;
              continue;
            } else if (importOption === "update") {
              // Atualizar o cliente existente
              console.log(`Atualizando cliente: ${clientData.name} (${clientData.email})`);
              const result = await updateClient(existingClient.id, clientData);
              if (result) {
                updated++;
              } else {
                errors++;
              }
              continue;
            }
            // Para "replace", apenas adicionaremos novos clientes e ignoraremos duplicatas
          }
          
          // Adicionar como novo cliente
          console.log(`Adicionando novo cliente: ${clientData.name} (${clientData.email || 'sem email'})`);
          const result = await createClient(clientData as Omit<Client, "id" | "createdAt" | "updatedAt" | "payments">);
          if (result) {
            added++;
          } else {
            errors++;
          }
          
        } catch (error) {
          console.error("Erro ao importar cliente:", error);
          errors++;
        }
      }
      
      // Atualizar o resumo
      const importSummary = {
        total,
        added,
        updated,
        skipped,
        errors
      };
      
      setSummary(importSummary);
      console.log("Resumo da importação:", importSummary);
      
      // Mostrar toast com resultados
      if (errors > 0) {
        toast.warning(`Importação concluída com problemas: ${added} adicionados, ${updated} atualizados, ${errors} erros`);
      } else {
        toast.success(`Importação concluída: ${added} adicionados, ${updated} atualizados`);
      }
      
    } catch (error) {
      console.error("Erro durante a importação:", error);
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
