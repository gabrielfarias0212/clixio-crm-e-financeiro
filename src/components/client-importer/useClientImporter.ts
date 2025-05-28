
import { useState, useCallback, useMemo } from "react";
import { mapClientData } from "./mapClientData";
import { createClient, fetchClients, updateClient } from "@/utils/supabaseUtils";
import { Client } from "@/utils/types";
import { toast } from "sonner";
import { ImportOption, ImportSummary } from "./types";

// Tamanho do lote para processamento
const BATCH_SIZE = 10;

export function useClientImporter(data: any[]) {
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importOption, setImportOption] = useState<ImportOption>("skip");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [progress, setProgress] = useState(0);

  // Memoizar dados mapeados para evitar recálculos
  const mappedClients = useMemo(() => {
    return data
      .filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== ""))
      .map(row => mapClientData(row));
  }, [data]);

  // Função otimizada para verificação de duplicatas
  const checkForDuplicates = useCallback(async () => {
    try {
      console.log("Verificando duplicatas...");
      
      // Buscar clientes existentes uma única vez
      const existingClients = await fetchClients();
      
      // Criar mapa de emails para lookup O(1)
      const existingEmails = new Set(
        existingClients
          .map(client => client.email)
          .filter(email => email) // Filtrar emails vazios
      );
      
      // Contar duplicatas usando Set lookup
      const duplicates = mappedClients.filter(client => 
        client.email && existingEmails.has(client.email)
      ).length;
      
      console.log(`${duplicates} duplicatas encontradas`);
      return duplicates;
    } catch (error) {
      console.error("Erro ao verificar duplicatas:", error);
      return 0;
    }
  }, [mappedClients]);

  const handleStartImport = useCallback(async () => {
    try {
      console.log("Iniciando preparação da importação...");
      
      const duplicates = await checkForDuplicates();
      setDuplicateCount(duplicates);
      
      if (duplicates > 0) {
        setShowConfirmDialog(true);
      } else {
        await startImport();
      }
    } catch (error) {
      console.error("Erro ao preparar importação:", error);
      toast.error("Erro ao preparar a importação");
    }
  }, [checkForDuplicates]);

  // Função para processar em lotes
  const processBatch = useCallback(async (
    batch: any[], 
    existingClientsMap: Map<string, Client>,
    batchNumber: number,
    totalBatches: number
  ) => {
    console.log(`Processando lote ${batchNumber}/${totalBatches} (${batch.length} itens)`);
    
    const promises = batch.map(async (clientData) => {
      try {
        const existingClient = clientData.email 
          ? existingClientsMap.get(clientData.email)
          : null;
        
        if (existingClient) {
          if (importOption === "skip") {
            return { type: 'skipped' };
          } else if (importOption === "update") {
            const result = await updateClient(existingClient.id, clientData);
            return result ? { type: 'updated' } : { type: 'error' };
          }
        }
        
        // Adicionar como novo cliente
        const result = await createClient(clientData as Omit<Client, "id" | "createdAt" | "updatedAt" | "payments">);
        return result ? { type: 'added' } : { type: 'error' };
        
      } catch (error) {
        console.error("Erro ao processar cliente:", error);
        return { type: 'error' };
      }
    });

    // Processar o lote em paralelo
    const results = await Promise.all(promises);
    
    // Atualizar progresso
    const progressPercent = Math.round(((batchNumber) / totalBatches) * 100);
    setProgress(progressPercent);
    
    return results;
  }, [importOption]);

  const startImport = useCallback(async () => {
    setImporting(true);
    setShowConfirmDialog(false);
    setProgress(0);
    
    try {
      console.log(`Iniciando importação de ${mappedClients.length} clientes...`);
      
      // Buscar clientes existentes uma única vez e criar mapa para lookup
      const existingClients = await fetchClients();
      const existingClientsMap = new Map(
        existingClients
          .filter(client => client.email)
          .map(client => [client.email, client])
      );
      
      // Dividir em lotes para processamento
      const batches = [];
      for (let i = 0; i < mappedClients.length; i += BATCH_SIZE) {
        batches.push(mappedClients.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`Processando em ${batches.length} lotes de ${BATCH_SIZE} itens`);
      
      // Inicializar contadores
      let added = 0, updated = 0, skipped = 0, errors = 0;
      
      // Processar lotes sequencialmente para não sobrecarregar o banco
      for (let i = 0; i < batches.length; i++) {
        const results = await processBatch(batches[i], existingClientsMap, i + 1, batches.length);
        
        // Contar resultados
        results.forEach(result => {
          switch (result.type) {
            case 'added': added++; break;
            case 'updated': updated++; break;
            case 'skipped': skipped++; break;
            case 'error': errors++; break;
          }
        });
        
        // Pequena pausa entre lotes para não sobrecarregar
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Atualizar resultado final
      setSummary({
        total: mappedClients.length,
        added,
        updated,
        skipped,
        errors
      });
      
      setProgress(100);
      
      console.log(`Importação concluída: ${added} adicionados, ${updated} atualizados, ${skipped} ignorados, ${errors} erros`);
      toast.success(`Importação concluída: ${added} adicionados, ${updated} atualizados`);
      
    } catch (error) {
      console.error("Erro durante importação:", error);
      toast.error("Erro durante a importação");
    } finally {
      setImporting(false);
    }
  }, [mappedClients, processBatch]);
  
  return {
    importing,
    summary,
    duplicateCount,
    importOption,
    showConfirmDialog,
    progress,
    setImportOption,
    setShowConfirmDialog,
    handleStartImport,
    startImport
  };
}
