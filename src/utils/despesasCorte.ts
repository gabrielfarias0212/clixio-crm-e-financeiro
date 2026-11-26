import { toISODate } from "@/utils/clientUtils";

/**
 * Despesas passam a vir SOMENTE do módulo Finanças (fin_lancamentos) a partir desta data.
 * Antes dela, o histórico continua vindo das saídas do módulo Financeiro antigo (wedding_transactions).
 * O módulo antigo fica só para ENTRADAS (contratos, clientes e trabalhos).
 */
export const CORTE_DESPESAS_ISO = "2026-09-01";
export const CORTE_DESPESAS_MES = CORTE_DESPESAS_ISO.slice(0, 7);

/** Saída do módulo antigo que ainda vale (anterior ao corte). */
export const saidaAntigaValida = (t: { type: string; date: string }): boolean =>
  t.type !== "saída" || (toISODate(t.date) || "") < CORTE_DESPESAS_ISO;
