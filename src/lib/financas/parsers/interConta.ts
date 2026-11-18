import type { LinhaConta, ResultadoParse, TipoLinhaConta } from "./types";

const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const toIso = (d: string) => d.split("/").reverse().join("-");

function classificar(desc: string, sentido: "entrada" | "saida"): TipoLinhaConta {
  if (/fatura cart[aã]o/i.test(desc)) return "pagamento_fatura";
  if (/tarifa|iof/i.test(desc)) return "tarifa";
  return sentido;
}

/** Extrato da conta Inter: metadados em texto, ';' como separador, decimal com vírgula, valor com sinal,
 *  "Saldo" é corrente (linha a linha) e o saldo final vem no cabeçalho. Descrição: `Tipo: "detalhe"`. */
export function parseInterConta(text: string): ResultadoParse<LinhaConta> & { saldoFinal: number | null; saldoLinhaAFinal: number | null } {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);
  const h = lines.findIndex((l) => l.startsWith("Data Lançamento;"));
  if (h < 0) throw new Error("Layout não reconhecido: cabeçalho 'Data Lançamento' ausente");
  const saldoHdr = lines.slice(0, h).find((l) => l.startsWith("Saldo:"));
  const saldoFinal = saldoHdr ? num(saldoHdr.split(";")[1]) : null;

  const linhas: LinhaConta[] = [];
  let ultimoSaldo: number | null = null;
  for (const l of lines.slice(h + 1)) {
    if (!l.trim()) continue;
    const c = l.split(";");
    if (c.length < 4) continue;
    const v = num(c[2]);
    const sentido = v >= 0 ? "entrada" : "saida";
    const m = c[1].match(/^(.*?):\s*"(.*)"\s*$/);
    linhas.push({
      data: toIso(c[0]), dataContabil: toIso(c[0]),
      titulo: m ? m[1] : c[1], descricao: m ? m[2] : c[1],
      valor: Math.abs(v), sentido, tipo: classificar(c[1], sentido),
    });
    ultimoSaldo = num(c[3]);
  }
  const total = Math.round(linhas.reduce((s, l) => s + (l.sentido === "entrada" ? l.valor : -l.valor), 0) * 100) / 100;
  return { linhas, total, avisos: [], saldoFinal, saldoLinhaAFinal: ultimoSaldo };
}
