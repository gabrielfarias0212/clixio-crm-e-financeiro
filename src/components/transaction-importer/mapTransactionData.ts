
import { normalizeTransactionData } from './utils/normalizers';
import { TransactionImportData } from './types';

export const mapTransactionData = (row: any): TransactionImportData | null => {
  console.log('Dados brutos da linha:', row);
  
  // Função auxiliar para extrair valor real de estruturas complexas
  const extractValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object' && value._type === 'undefined') return '';
    if (typeof value === 'object' && value.value !== undefined) return extractValue(value.value);
    return String(value || '');
  };

  // Mapear diferentes nomes de colunas possíveis
  const mappedRow = {
    // Data - verificar várias possibilidades
    data: extractValue(
      row.data || row.Data || row.DATE || row.date || 
      row['Data da Transação'] || row['Data da transação'] ||
      row['Data Transação'] || row['Data Transacao'] ||
      row['Data'] || row['DATE'] || row['Date']
    ),
    
    // Descrição - verificar várias possibilidades
    descricao: extractValue(
      row.descricao || row.Descricao || row.DESCRICAO ||
      row.description || row.Description || row.DESCRIPTION ||
      row.nome || row.Nome || row.NOME ||
      row['Nome da Transação'] || row['Nome da transação'] ||
      row.historico || row.Historico || row.HISTORICO ||
      row['Descrição'] || row['DESCRIÇÃO'] ||
      row.transacao || row.Transacao || row.TRANSACAO
    ),
    
    // Valor - verificar várias possibilidades
    valor: extractValue(
      row.valor || row.Valor || row.VALOR ||
      row.amount || row.Amount || row.AMOUNT ||
      row.value || row.Value || row.VALUE ||
      row['Valor da Transação'] || row['Valor da transação'] ||
      row.preco || row.Preco || row.PRECO
    ),
    
    // Tipo (opcional)
    tipo: extractValue(
      row.tipo || row.Tipo || row.TIPO ||
      row.type || row.Type || row.TYPE ||
      row['Tipo de Transação'] || row['Tipo de transação']
    ),
    
    // Categoria (opcional)
    categoria: extractValue(
      row.categoria || row.Categoria || row.CATEGORIA ||
      row.category || row.Category || row.CATEGORY
    ),
    
    // Cliente (opcional)
    cliente: extractValue(
      row.cliente || row.Cliente || row.CLIENTE ||
      row.client || row.Client || row.CLIENT ||
      row['Nome do Cliente'] || row['Nome do cliente']
    )
  };
  
  console.log('Dados mapeados:', mappedRow);
  
  return normalizeTransactionData(mappedRow);
};
