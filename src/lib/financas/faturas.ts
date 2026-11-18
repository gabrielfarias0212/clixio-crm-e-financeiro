import type { LinhaCartao } from "./parsers/types";

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Compara o total lido do arquivo com o total da fatura informado pelo usuário (app do banco). */
export function conferir(totalLido: number, totalDeclarado: number) {
  const diferenca = r2(totalDeclarado - totalLido);
  return { ok: Math.abs(diferenca) < 0.005, diferenca };
}

export interface ParcelaProjetada {
  competencia: string; // yyyy-mm-01 da fatura em que cai
  descricao: string;
  parcela: number;
  total: number;
  valor: number;
  /** Compra estornada: a parcela ainda será cobrada, mas já foi creditada (crédito antecipado). */
  estornada: boolean;
}

function somaMeses(iso: string, n: number) {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 10);
}

/** Projeta as parcelas restantes nas próximas faturas. NUNCA remove parcelas por causa de estorno:
 *  o banco continua cobrando; só marcamos como estornada. */
export function projetarParcelas(linhas: LinhaCartao[], competenciaAtual: string): ParcelaProjetada[] {
  const estornos = linhas.filter((l) => l.tipo === "estorno" && l.valor < 0);
  const res: ParcelaProjetada[] = [];
  for (const l of linhas) {
    if (l.valor <= 0 || !l.parcelaAtual || !l.parcelaTotal) continue;
    const credito = estornos.filter((e) => e.descricao === l.descricao).reduce((s, e) => s + -e.valor, 0);
    const estornada = credito + 0.005 >= l.valor * l.parcelaTotal; // só quando o crédito cobre a compra inteira
    for (let k = 1; k <= l.parcelaTotal - l.parcelaAtual; k++) {
      res.push({
        competencia: somaMeses(competenciaAtual, k), descricao: l.descricao,
        parcela: l.parcelaAtual + k, total: l.parcelaTotal, valor: l.valor, estornada,
      });
    }
  }
  return res;
}

export function resumoProjecao(p: ParcelaProjetada[]) {
  const total = r2(p.reduce((s, x) => s + x.valor, 0));
  const estornadas = r2(p.filter((x) => x.estornada).reduce((s, x) => s + x.valor, 0));
  return { total, estornadas, dividaReal: r2(total - estornadas) };
}
