import { useBusinessFixedExpenses } from "@/hooks/useBusinessFixedExpenses";

/**
 * Fonte única do custo fixo mensal usado pelo Ponto de Equilíbrio e pelo
 * Fluxo Futuro.
 *
 * Hoje lê o cadastro antigo (business_fixed_expenses). Quando o módulo
 * Finanças estiver no ar, só este hook precisa mudar para ler as despesas
 * fixas/recorrentes de lá — as telas que o consomem não mudam.
 *
 * `configured` é false quando não há custo fixo informado, para as telas
 * não exibirem números enganosos (ex.: "no azul" com custo zero).
 */
export function useFixedCosts() {
  const { loading, getTotalMonthlyExpenses } = useBusinessFixedExpenses();
  const monthlyTotal = getTotalMonthlyExpenses();
  return { loading, monthlyTotal, configured: monthlyTotal > 0 };
}
