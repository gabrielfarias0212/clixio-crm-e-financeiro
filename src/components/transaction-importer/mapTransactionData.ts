
import { normalizeTransactionData } from './utils/normalizers';
import { TransactionImportData } from './types';

export const mapTransactionData = (row: any): TransactionImportData | null => {
  // Mapear diferentes nomes de colunas possíveis
  const mappedRow = {
    // Data
    data: row.data || row.Data || row.DATE || row.date || 
          row['Data da Transação'] || row['Data da transação'] ||
          row['Data Transação'] || row['Data Transacao'],
    
    // Descrição
    descricao: row.descricao || row.Descricao || row.DESCRICAO ||
               row.description || row.Description || row.DESCRIPTION ||
               row.nome || row.Nome || row.NOME ||
               row['Nome da Transação'] || row['Nome da transação'] ||
               row.historico || row.Historico || row.HISTORICO,
    
    // Valor
    valor: row.valor || row.Valor || row.VALOR ||
           row.amount || row.Amount || row.AMOUNT ||
           row.value || row.Value || row.VALUE ||
           row['Valor da Transação'] || row['Valor da transação'],
    
    // Tipo (opcional)
    tipo: row.tipo || row.Tipo || row.TIPO ||
          row.type || row.Type || row.TYPE ||
          row['Tipo de Transação'] || row['Tipo de transação'],
    
    // Categoria (opcional)
    categoria: row.categoria || row.Categoria || row.CATEGORIA ||
               row.category || row.Category || row.CATEGORY,
    
    // Cliente (opcional)
    cliente: row.cliente || row.Cliente || row.CLIENTE ||
             row.client || row.Client || row.CLIENT ||
             row['Nome do Cliente'] || row['Nome do cliente']
  };
  
  return normalizeTransactionData(mappedRow);
};
