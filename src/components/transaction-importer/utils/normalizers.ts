
import { TransactionImportData } from '../types';
import { parseDate, parseAmount } from './validators';

export const normalizeTransactionData = (rawData: any): TransactionImportData | null => {
  try {
    // Extrair dados básicos
    const description = rawData.descricao || rawData.description || rawData.nome || rawData.name || '';
    const dateStr = rawData.data || rawData.date || '';
    const amountValue = rawData.valor || rawData.amount || rawData.value || 0;
    
    // Validar campos obrigatórios
    if (!description.trim()) {
      console.warn('Descrição vazia encontrada:', rawData);
      return null;
    }
    
    const normalizedDate = parseDate(dateStr);
    if (!normalizedDate) {
      console.warn('Data inválida encontrada:', dateStr);
      return null;
    }
    
    const amount = parseAmount(amountValue);
    if (isNaN(amount)) {
      console.warn('Valor inválido encontrado:', amountValue);
      return null;
    }
    
    // Determinar tipo baseado no valor (se não especificado)
    let type: 'entrada' | 'saída' = amount >= 0 ? 'entrada' : 'saída';
    
    // Se tipo foi especificado na planilha, usar ele
    const specifiedType = rawData.tipo || rawData.type;
    if (specifiedType) {
      const lowerType = specifiedType.toLowerCase();
      if (lowerType.includes('entrada') || lowerType.includes('receita') || lowerType.includes('credito')) {
        type = 'entrada';
      } else if (lowerType.includes('saida') || lowerType.includes('saída') || lowerType.includes('despesa') || lowerType.includes('debito')) {
        type = 'saída';
      }
    }
    
    // Categoria padrão baseada no tipo
    let category = type === 'entrada' ? 'outras receitas' : 'outras despesas';
    
    // Se categoria foi especificada na planilha
    const specifiedCategory = rawData.categoria || rawData.category;
    if (specifiedCategory && specifiedCategory.trim()) {
      category = specifiedCategory.trim();
    }
    
    // Nome do cliente (opcional)
    const clientName = rawData.cliente || rawData.client || rawData.client_name || '';
    
    return {
      date: normalizedDate,
      description: description.trim(),
      amount: Math.abs(amount), // Sempre positivo, o tipo determina entrada/saída
      type,
      category,
      clientName: clientName.trim() || undefined
    };
    
  } catch (error) {
    console.error('Erro ao normalizar dados da transação:', error, rawData);
    return null;
  }
};
