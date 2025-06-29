
import { TransactionImportData } from '../types';
import { parseDate, parseAmount } from './validators';

export const normalizeTransactionData = (rawData: any): TransactionImportData | null => {
  try {
    console.log('Normalizando dados:', rawData);
    
    // Extrair dados básicos
    const description = String(rawData.descricao || rawData.description || rawData.nome || rawData.name || '').trim();
    const dateStr = String(rawData.data || rawData.date || '').trim();
    const amountValue = rawData.valor || rawData.amount || rawData.value || 0;
    
    console.log('Valores extraídos:', { description, dateStr, amountValue });
    
    // Validar campos obrigatórios
    if (!description) {
      console.warn('Descrição vazia encontrada:', rawData);
      return null;
    }
    
    const normalizedDate = parseDate(dateStr);
    if (!normalizedDate) {
      console.warn('Data inválida encontrada:', dateStr);
      return null;
    }
    
    const amount = parseAmount(amountValue);
    if (isNaN(amount) || amount === 0) {
      console.warn('Valor inválido encontrado:', amountValue);
      return null;
    }
    
    // Determinar tipo baseado no valor (se não especificado)
    let type: 'entrada' | 'saída' = amount >= 0 ? 'entrada' : 'saída';
    
    // Se tipo foi especificado na planilha, usar ele
    const specifiedType = String(rawData.tipo || rawData.type || '').toLowerCase();
    if (specifiedType) {
      if (specifiedType.includes('entrada') || specifiedType.includes('receita') || 
          specifiedType.includes('credito') || specifiedType.includes('credit')) {
        type = 'entrada';
      } else if (specifiedType.includes('saida') || specifiedType.includes('saída') || 
                 specifiedType.includes('despesa') || specifiedType.includes('debito') || 
                 specifiedType.includes('debit')) {
        type = 'saída';
      }
    }
    
    // Categoria padrão baseada no tipo
    let category = type === 'entrada' ? 'outras receitas' : 'outras despesas';
    
    // Se categoria foi especificada na planilha
    const specifiedCategory = String(rawData.categoria || rawData.category || '').trim();
    if (specifiedCategory) {
      category = specifiedCategory;
    }
    
    // Nome do cliente (opcional)
    const clientName = String(rawData.cliente || rawData.client || rawData.client_name || '').trim();
    
    const result = {
      date: normalizedDate,
      description: description,
      amount: Math.abs(amount), // Sempre positivo, o tipo determina entrada/saída
      type,
      category,
      clientName: clientName || undefined
    };
    
    console.log('Resultado normalizado:', result);
    return result;
    
  } catch (error) {
    console.error('Erro ao normalizar dados da transação:', error, rawData);
    return null;
  }
};
