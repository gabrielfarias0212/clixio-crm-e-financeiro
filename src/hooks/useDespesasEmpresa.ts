import { useEffect, useState } from "react";
import { listarFaturas, listarLancamentos } from "@/lib/financas/api";

// Despesas da EMPRESA (PJ) vindas do módulo Finanças, por mês (AAAA-MM).
// Só o que sai do caixa da empresa: cartão da empresa (mês da fatura) + débitos das contas marcados como PJ (mês da data).
// Compras da empresa no cartão PESSOAL ficam de fora: não saíram do caixa da empresa (entram no Acerto PF × PJ).
// Pagamento de fatura e transferência ficam fora.
let cache: { em: number; porMes: Record<string, number> } | null = null;
const TTL = 2 * 60 * 1000;

async function calcular(): Promise<Record<string, number>> {
  const [lancs, faturas] = await Promise.all([listarLancamentos(), listarFaturas()]);
  const comp = new Map<string, string>(faturas.map((f: any) => [f.id, String(f.competencia).slice(0, 7)]));
  const porMes: Record<string, number> = {};
  for (const l of lancs) {
    if (l.status !== "realizado" || l.pertence_a !== "PJ" || (l.tipo !== "saida" && l.tipo !== "estorno")) continue;
    if (l.pagador === "PF" && l.fatura_id) continue; // compra da empresa no cartão pessoal
    const mes = (l.fatura_id && comp.get(l.fatura_id)) || l.data.slice(0, 7);
    porMes[mes] = (porMes[mes] ?? 0) + (l.tipo === "estorno" ? -l.valor : l.valor);
  }
  return porMes;
}

export function useDespesasEmpresa() {
  const [porMes, setPorMes] = useState<Record<string, number>>(cache?.porMes ?? {});
  useEffect(() => {
    if (cache && Date.now() - cache.em < TTL) return;
    let vivo = true;
    calcular().then((p) => { cache = { em: Date.now(), porMes: p }; if (vivo) setPorMes(p); }).catch(() => {});
    return () => { vivo = false; };
  }, []);
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const ano = mesAtual.slice(0, 4);
  const doMes = Math.max(0, porMes[mesAtual] ?? 0);
  const doAno = Object.entries(porMes).filter(([m]) => m.startsWith(ano)).reduce((s, [, v]) => s + v, 0);
  const total = Object.values(porMes).reduce((s, v) => s + v, 0);
  return { doMes, doAno: Math.max(0, doAno), total: Math.max(0, total) };
}
