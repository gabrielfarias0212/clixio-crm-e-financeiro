import { useEffect, useState } from "react";
import { listarFaturas, listarLancamentos } from "@/lib/financas/api";
import { CORTE_DESPESAS_MES } from "@/utils/despesasCorte";

// Despesas da EMPRESA (PJ) vindas do módulo Finanças, por mês (AAAA-MM).
// Cartão conta no mês da fatura (vencimento); conta, no mês da data. Pagamento de fatura e transferência ficam fora.
type Mes = { bruto: number; estornos: number };
let cache: { em: number; porMes: Record<string, Mes> } | null = null;
const TTL = 2 * 60 * 1000;

async function calcular(): Promise<Record<string, Mes>> {
  const [lancs, faturas] = await Promise.all([listarLancamentos(), listarFaturas()]);
  const comp = new Map<string, string>(faturas.map((f: any) => [f.id, String(f.competencia).slice(0, 7)]));
  const porMes: Record<string, Mes> = {};
  for (const l of lancs) {
    if (l.status !== "realizado" || l.pertence_a !== "PJ" || (l.tipo !== "saida" && l.tipo !== "estorno")) continue;
    const mes = (l.fatura_id && comp.get(l.fatura_id)) || l.data.slice(0, 7);
    const r = porMes[mes] ?? (porMes[mes] = { bruto: 0, estornos: 0 });
    if (l.tipo === "estorno") r.estornos += l.valor; else r.bruto += l.valor;
  }
  return porMes;
}

export function useDespesasEmpresa() {
  const [porMes, setPorMes] = useState<Record<string, Mes>>(cache?.porMes ?? {});
  useEffect(() => {
    if (cache && Date.now() - cache.em < TTL) return;
    let vivo = true;
    calcular().then((p) => { cache = { em: Date.now(), porMes: p }; if (vivo) setPorMes(p); }).catch(() => {});
    return () => { vivo = false; };
  }, []);
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const ano = mesAtual.slice(0, 4);
  const liq = (m?: Mes) => (m ? m.bruto - m.estornos : 0);
  const doMes = Math.max(0, liq(porMes[mesAtual]));
  const doAno = Object.entries(porMes).filter(([m]) => m.startsWith(ano)).reduce((s, [, v]) => s + liq(v), 0);
  const total = Object.values(porMes).reduce((s, v) => s + liq(v), 0);
  // Líquido por mês (AAAA-MM), só de meses a partir do corte (antes disso vale o módulo antigo)
  const liquidoPorMes: Record<string, number> = {};
  for (const [m, v] of Object.entries(porMes)) if (m >= CORTE_DESPESAS_MES) liquidoPorMes[m] = Math.max(0, liq(v));
  const doAnoPosCorte = Object.entries(liquidoPorMes).filter(([m]) => m.startsWith(ano)).reduce((s, [, v]) => s + v, 0);
  return { doMes, doAno: Math.max(0, doAno), total: Math.max(0, total), doMesBruto: porMes[mesAtual]?.bruto ?? 0, liquidoPorMes, doAnoPosCorte };
}
