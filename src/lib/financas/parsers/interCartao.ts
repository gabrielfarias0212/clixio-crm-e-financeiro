import type { LinhaCartao, ResultadoParse } from "./types";

const toIso = (d: string) => d.split("/").reverse().join("-");
const brl = (s: string) => {
  const neg = s.includes("-");
  const n = Number(s.replace(/[^\d,]/g, "").replace(",", "."));
  return neg ? -n : n;
};
const norm = (s: string) => s.replace(/\s+/g, " ").trim().toUpperCase();
const r2 = (n: number) => Math.round(n * 100) / 100;
const dia = (iso: string) => Date.parse(iso + "T00:00:00Z") / 86400000;

function csvLine(l: string): string[] {
  const r: string[] = []; let cur = ""; let q = false;
  for (const ch of l) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) { r.push(cur); cur = ""; }
    else cur += ch;
  }
  r.push(cur);
  return r;
}

export interface ResultadoInterCartao extends ResultadoParse<LinhaCartao> {
  /** Pagamentos da fatura anterior que aparecem como crédito: neutros, FORA do total da fatura. */
  pagamentos: LinhaCartao[];
}

/** CSV de fatura do Inter: vírgula + aspas, "R$ 1,00", sem final de cartão. Tipo = "Compra à vista" | "Parcela n/m".
 *  O IOF internacional vem em linha separada (≈3,5% da compra, 1–4 dias depois) e é somado à compra de origem. */
export function parseInterCartao(text: string): ResultadoInterCartao {
  const rows = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!rows[0]?.startsWith('"Data","Lançamento"')) throw new Error("Layout não reconhecido: cabeçalho Inter ausente");
  const avisos: string[] = [];
  let todas: LinhaCartao[] = rows.slice(1).map((l) => {
    const [data, lanc, cat, tipo, valor] = csvLine(l);
    const m = tipo.match(/Parcela (\d+)\/(\d+)/);
    const v = brl(valor);
    return {
      data: toIso(data), cartaoFinal: "", categoriaBanco: cat, descricao: norm(lanc),
      parcelaAtual: m ? +m[1] : null, parcelaTotal: m ? +m[2] : null, valor: v, iof: 0, usd: null,
      tipo: v < 0 ? "credito_a_confirmar" : /ENCARGOS|JUROS|MULTA|ROTATIVO|IOF (ADICIONAL|DIARIO)/.test(norm(lanc)) ? "tarifa" : "compra",
    } as LinhaCartao;
  });

  const pagamentos = todas.filter((l) => /^PAGTO|PAGAMENTO/.test(l.descricao) && l.valor < 0);
  todas = todas.filter((l) => !pagamentos.includes(l));

  // IOF: casa com a compra cujo valor × 3,5% ≈ IOF, até 4 dias antes
  const iofs = todas.filter((l) => /IOF INTERNACIONAL/.test(l.descricao));
  const compras = todas.filter((l) => !/IOF INTERNACIONAL/.test(l.descricao));
  for (const iof of iofs) {
    const alvo = compras.find((c) => c.iof === 0 && c.valor > 0 && Math.abs(r2(c.valor * 0.035) - iof.valor) <= 0.02 && dia(iof.data) - dia(c.data) >= 0 && dia(iof.data) - dia(c.data) <= 4);
    if (alvo) { alvo.iof = iof.valor; alvo.valor = r2(alvo.valor + iof.valor); }
    else { compras.push(iof); avisos.push(`IOF sem compra correspondente: ${iof.valor}`); }
  }

  for (const l of compras) if (l.valor < 0) l.tipo = "credito_a_confirmar";
  const total = r2(compras.reduce((s, l) => s + l.valor, 0));
  return { linhas: compras, total, avisos, pagamentos };
}
