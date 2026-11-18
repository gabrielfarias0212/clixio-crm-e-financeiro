import type { LinhaConta, ResultadoParse, TipoLinhaConta } from "./types";

const toIso = (d: string) => d.split("/").reverse().join("-");

function csvLine(l: string): string[] {
  const r: string[] = []; let cur = ""; let q = false;
  for (const ch of l) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) { r.push(cur); cur = ""; }
    else cur += ch;
  }
  r.push(cur);
  return r.map((s) => s.trim());
}

function classificar(titulo: string, sentido: "entrada" | "saida"): TipoLinhaConta {
  if (/PGTO FAT CARTAO/i.test(titulo)) return "pagamento_fatura";
  if (/APLICA[ÇC][ÃA]O DE CDB|CDB/i.test(titulo)) return "investimento";
  if (/IOF|TARIFA|PACOTE/i.test(titulo)) return "tarifa";
  return sentido;
}

/** CSV de extrato da conta C6: cabeçalho de texto + tabela com vírgula; "Saldo do Dia" só vale para conferência final. */
export function parseC6Conta(text: string): ResultadoParse<LinhaConta> & { saldoFinal: number | null } {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);
  const h = lines.findIndex((l) => l.startsWith("Data Lançamento,"));
  if (h < 0) throw new Error("Layout não reconhecido: cabeçalho 'Data Lançamento' ausente");

  const linhas: LinhaConta[] = [];
  let saldoFinal: number | null = null;
  for (const l of lines.slice(h + 1)) {
    if (!l.trim()) continue;
    const c = csvLine(l);
    if (c.length < 7) continue;
    const ent = Number(c[4]); const sai = Number(c[5]);
    const sentido = ent > 0 ? "entrada" : "saida";
    linhas.push({
      data: toIso(c[0]), dataContabil: toIso(c[1]), titulo: c[2], descricao: c[3],
      valor: ent > 0 ? ent : sai, sentido, tipo: classificar(c[2], sentido),
    });
    saldoFinal = Number(c[6]);
  }
  const total = Math.round(linhas.reduce((s, l) => s + (l.sentido === "entrada" ? l.valor : -l.valor), 0) * 100) / 100;
  return { linhas, total, avisos: [], saldoFinal };
}
