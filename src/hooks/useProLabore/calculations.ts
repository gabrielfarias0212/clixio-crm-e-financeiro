
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
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  }

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  console.log('=== Calculando receita líquida ===');
  console.log('Tipo de cálculo:', tipo);
  console.log('Período:', startDateStr, 'até', endDateStr);
  console.log('Total de transações recebidas:', transactions.length);

  // Filtrar transações do período
  const periodTransactions = transactions.filter(t => {
    const transactionDate = t.date;
    const isInPeriod = transactionDate >= startDateStr && transactionDate <= endDateStr;
    if (isInPeriod) {
      console.log('Transação no período:', t.date, t.type, t.amount, t.description);
    }
    return isInPeriod;
  });

  console.log('Transações do período filtradas:', periodTransactions.length);

  const receitas = periodTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const despesas = periodTransactions
    .filter(t => t.type === 'saída')
    .reduce((sum, t) => sum + t.amount, 0);

  const receitaLiquida = receitas - despesas;

  console.log('Receitas do período:', receitas);
  console.log('Despesas do período:', despesas);
  console.log('Receita líquida calculada:', receitaLiquida);

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
  console.log('Receita líquida recebida:', netRevenue);
  console.log('Percentual configurado:', config.percentual);
  console.log('Valor do pró-labore calculado:', proLaboreAmount);
  
  return Math.max(0, proLaboreAmount);
};

export const calculateWithdrawnAmount = (
  config: ProLaboreConfig | null,
  registros: ProLaboreRegistro[]
): number => {
  if (!config) {
    console.log('Sem configuração para calcular valor retirado');
    return 0;
  }

  const currentPeriod = getCurrentPeriodReference(config.tipo_calculo);
  const periodRegistros = registros.filter(r => r.periodo_referencia === currentPeriod);
  const withdrawn = periodRegistros.reduce((sum, r) => sum + r.valor, 0);
  
  console.log('=== Calculando valor já retirado ===');
  console.log('Período atual:', currentPeriod);
  console.log('Registros do período:', periodRegistros.length);
  console.log('Registros encontrados:', periodRegistros);
  console.log('Valor total retirado:', withdrawn);
  
  return withdrawn;
};
