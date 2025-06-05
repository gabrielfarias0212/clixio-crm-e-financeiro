
import { Transaction } from '@/utils/types';
import { ProLaboreConfig, ProLaboreRegistro, CalculationType } from './types';
import { getCurrentPeriodReference } from './utils';

export const calculateNetRevenue = (
  transactions: Transaction[],
  tipo: CalculationType
): number => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (tipo === 'mensal') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    // Weekly calculation
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startDate = new Date(now);
    startDate.setDate(diff);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  }

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  console.log('=== Calculando receita líquida ===');
  console.log('Período:', startDateStr, 'até', endDateStr);
  console.log('Total de transações:', transactions.length);

  const periodTransactions = transactions.filter(t => 
    t.date >= startDateStr && t.date <= endDateStr
  );

  console.log('Transações do período:', periodTransactions.length);

  const receitas = periodTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const despesas = periodTransactions
    .filter(t => t.type === 'saída')
    .reduce((sum, t) => sum + t.amount, 0);

  const receitaLiquida = receitas - despesas;

  console.log('Receitas do período:', receitas);
  console.log('Despesas do período:', despesas);
  console.log('Receita líquida:', receitaLiquida);

  return receitaLiquida;
};

export const calculateAvailableAmount = (
  config: ProLaboreConfig | null,
  netRevenue: number
): number => {
  if (!config) {
    console.log('Sem configuração de pró-labore');
    return 0;
  }

  const proLaboreAmount = (netRevenue * config.percentual) / 100;
  
  console.log('=== Calculando pró-labore disponível ===');
  console.log('Receita líquida:', netRevenue);
  console.log('Percentual:', config.percentual);
  console.log('Valor calculado:', proLaboreAmount);
  
  return Math.max(0, proLaboreAmount);
};

export const calculateWithdrawnAmount = (
  config: ProLaboreConfig | null,
  registros: ProLaboreRegistro[]
): number => {
  if (!config) return 0;

  const currentPeriod = getCurrentPeriodReference(config.tipo_calculo);
  const withdrawn = registros
    .filter(r => r.periodo_referencia === currentPeriod)
    .reduce((sum, r) => sum + r.valor, 0);
  
  console.log('=== Calculando valor já retirado ===');
  console.log('Período atual:', currentPeriod);
  console.log('Registros do período:', registros.filter(r => r.periodo_referencia === currentPeriod).length);
  console.log('Valor retirado:', withdrawn);
  
  return withdrawn;
};
