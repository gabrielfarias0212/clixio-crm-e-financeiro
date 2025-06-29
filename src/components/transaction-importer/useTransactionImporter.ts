
import { useState, useCallback, useMemo } from "react";
import { mapTransactionData } from "./mapTransactionData";
import { createTransaction, fetchTransactions } from "@/utils/supabaseUtils";
import { Transaction } from "@/utils/types";
import { toast } from "sonner";
import { ImportOption, ImportSummary, TransactionImportData } from "./types";

const BATCH_SIZE = 10;

export function useTransactionImporter(data: any[]) {
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importOption, setImportOption] = useState<ImportOption>("skip");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [progress, setProgress] = useState(0);

  // Memoizar dados mapeados
  const mappedTransactions = useMemo(() => {
    return data
      .filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== null && v !== ""))
      .map(row => mapTransactionData(row))
      .filter(transaction => transaction !== null) as TransactionImportData[];
  }, [data]);

  // Verificar duplicatas
  const checkForDuplicates = useCallback(async () => {
    try {
      console.log("Verificando duplicatas de transações...");
      
      const existingTransactions = await fetchTransactions();
      
      // Criar chave única para comparação: data + descrição + valor
      const existingKeys = new Set(
        existingTransactions.map(t => 
          `${t.date}-${t.description.toLowerCase()}-${t.amount}`
        )
      );
      
      const duplicates = mappedTransactions.filter(t => 
        existingKeys.has(`${t.date}-${t.description.toLowerCase()}-${t.amount}`)
      ).length;
      
      console.log(`${duplicates} transações duplicadas encontradas`);
      return duplicates;
    } catch (error) {
      console.error("Erro ao verificar duplicatas:", error);
      return 0;
    }
  }, [mappedTransactions]);

  const handleStartImport = useCallback(async () => {
    try {
      console.log("Iniciando preparação da importação de transações...");
      
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

  // Processar em lotes
  const processBatch = useCallback(async (
    batch: TransactionImportData[], 
    existingTransactionsMap: Map<string, Transaction>,
    batchNumber: number,
    totalBatches: number
  ) => {
    console.log(`Processando lote ${batchNumber}/${totalBatches} (${batch.length} itens)`);
    
    const promises = batch.map(async (transactionData) => {
      try {
        const key = `${transactionData.date}-${transactionData.description.toLowerCase()}-${transactionData.amount}`;
        const existingTransaction = existingTransactionsMap.get(key);
        
        if (existingTransaction && importOption === "skip") {
          return { type: 'skipped' };
        }
        
        // Criar nova transação
        const newTransaction: Omit<Transaction, 'id' | 'createdAt'> = {
          amount: transactionData.amount,
          date: transactionData.date,
          type: transactionData.type,
          category: transactionData.category as any,
          description: transactionData.description,
          clientId: undefined, // Por enquanto não vinculamos automaticamente
          paymentId: undefined
        };
        
        const result = await createTransaction(newTransaction);
        return result ? { type: 'added' } : { type: 'error' };
        
      } catch (error) {
        console.error("Erro ao processar transação:", error);
        return { type: 'error' };
      }
    });

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
      console.log(`Iniciando importação de ${mappedTransactions.length} transações...`);
      
      // Buscar transações existentes para comparação
      const existingTransactions = await fetchTransactions();
      const existingTransactionsMap = new Map(
        existingTransactions.map(t => [
          `${t.date}-${t.description.toLowerCase()}-${t.amount}`, 
          t
        ])
      );
      
      // Dividir em lotes
      const batches = [];
      for (let i = 0; i < mappedTransactions.length; i += BATCH_SIZE) {
        batches.push(mappedTransactions.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`Processando em ${batches.length} lotes de ${BATCH_SIZE} itens`);
      
      let added = 0, skipped = 0, errors = 0;
      
      // Processar lotes sequencialmente
      for (let i = 0; i < batches.length; i++) {
        const results = await processBatch(batches[i], existingTransactionsMap, i + 1, batches.length);
        
        results.forEach(result => {
          switch (result.type) {
            case 'added': added++; break;
            case 'skipped': skipped++; break;
            case 'error': errors++; break;
          }
        });
        
        // Pausa entre lotes
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setSummary({
        total: mappedTransactions.length,
        added,
        skipped,
        errors
      });
      
      setProgress(100);
      
      console.log(`Importação concluída: ${added} adicionadas, ${skipped} ignoradas, ${errors} erros`);
      toast.success(`Importação concluída: ${added} transações importadas!`);
      
    } catch (error) {
      console.error("Erro durante importação:", error);
      toast.error("Erro durante a importação");
    } finally {
      setImporting(false);
    }
  }, [mappedTransactions, processBatch]);
  
  return {
    importing,
    summary,
    duplicateCount,
    importOption,
    showConfirmDialog,
    progress,
    mappedTransactions,
    setImportOption,
    setShowConfirmDialog,
    handleStartImport,
    startImport
  };
}
