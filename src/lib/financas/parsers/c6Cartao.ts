import type { LinhaCartao, ResultadoParse } from "./types";

const toIso = (d: string) => d.split("/").reverse().join("-");
const norm = (s: string) => s.replace(/^"+|"+$/g, "").replace(/\s+/g, " ").trim().toUpperCase();

/** CSV de fatura do C6: ';' como separador, decimal com ponto, sem total no arquivo. */
export function parseC6Cartao(text: string): ResultadoParse<LinhaCartao> & { pagamentos: LinhaCartao[] } {
  const avisos: string[] = [];
  const rows = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  const h = rows.findIndex((l) => l.startsWith("Data de Compra;"));
  if (h < 0) throw new Error("Layout não reconhecido: cabeçalho 'Data de Compra' ausente");

  const raw = rows.slice(h + 1).map((l) => l.split(";")).filter((c) => c.length >= 9);
  const out: LinhaCartao[] = [];

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    const [data, , final, cat, desc, parc, usdS, , brlS] = c;
    const valor = Number(brlS);
    const usd = Number(usdS) || 0;
    const m = parc.match(/^(\d+)\/(\d+)$/);

    // Compra internacional vem em 2 linhas: a compra (USD>0) e o IOF (USD=0, mesma descrição/data)
    const prox = raw[i + 1];
    if (usd > 0 && prox && prox[0] === data && norm(prox[4]) === norm(desc) && Number(prox[6]) === 0 && Number(prox[8]) > 0) {
      out.push({
        data: toIso(data), cartaoFinal: final, categoriaBanco: cat === "-" ? null : cat,
        descricao: norm(desc), parcelaAtual: null, parcelaTotal: null,
        valor: Math.round((valor + Number(prox[8])) * 100) / 100, iof: Number(prox[8]), usd, tipo: "compra",
      });
      i++;
      continue;
    }

    out.push({
      data: toIso(data), cartaoFinal: final, categoriaBanco: cat === "-" ? null : cat,
      descricao: norm(desc), parcelaAtual: m ? +m[1] : null, parcelaTotal: m ? +m[2] : null,
      valor, iof: 0, usd: usd || null,
      tipo: valor < 0 ? "credito_a_confirmar" : /ANUIDADE|TARIFA|MULTA|JUROS|ENCARGOS|IOF ROTATIVO/i.test(desc) ? "tarifa" : "compra",
    });
  }

  // "Inclusao de Pagamento" = quitação da fatura anterior: não é gasto nem estorno, fica fora do total
  const pagamentos = out.filter((l) => /^((INCLUSAO DE )?PAGAMENTO|PAG(AMENTO)? FATURA)/.test(l.descricao) && l.valor < 0);
  for (const p of pagamentos) out.splice(out.indexOf(p), 1);

  // Negativo + mesmo comerciante de uma compra positiva (ou rótulo "Estorno") => estorno.
  // Caso contrário fica "crédito a confirmar": nunca cancela parcelas por conta própria.
  const comprados = new Set(out.filter((l) => l.valor > 0).map((l) => l.descricao));
  for (const l of out) {
    if (l.valor < 0) {
      if (comprados.has(l.descricao) || /ESTORNO/.test(l.descricao)) l.tipo = "estorno";
      else avisos.push(`Crédito sem compra correspondente: ${l.descricao} (${l.valor})`);
    }
  }

  const total = Math.round(out.reduce((s, l) => s + l.valor, 0) * 100) / 100;
  return { linhas: out, total, avisos, pagamentos };
}
