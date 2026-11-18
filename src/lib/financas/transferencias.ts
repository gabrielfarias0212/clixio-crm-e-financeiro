import type { LinhaConta } from "./parsers/types";

export interface ParTransferencia { saida: LinhaConta; entrada: LinhaConta; }

const dia = (iso: string) => Date.parse(iso + "T00:00:00Z") / 86400000;

/** Casa saída de uma conta com entrada de outra (mesmo valor, até 1 dia de diferença, nome do titular na descrição).
 *  Pares encontrados são movimentações internas (neutras no consolidado). */
export function casarTransferencias(a: LinhaConta[], b: LinhaConta[], nomesTitular: string[]): ParTransferencia[] {
  const nomes = nomesTitular.map((n) => n.toUpperCase());
  const meu = (l: LinhaConta) => nomes.some((n) => (l.descricao + " " + l.titulo).toUpperCase().includes(n));
  const usados = new Set<LinhaConta>();
  const pares: ParTransferencia[] = [];
  const tenta = (origem: LinhaConta[], destino: LinhaConta[]) => {
    for (const s of origem.filter((l) => l.sentido === "saida" && meu(l))) {
      const e = destino.find((x) => !usados.has(x) && x.sentido === "entrada" && meu(x) && x.valor === s.valor && Math.abs(dia(x.data) - dia(s.data)) <= 1);
      if (e) { usados.add(e); pares.push({ saida: s, entrada: e }); }
    }
  };
  tenta(a, b); tenta(b, a);
  return pares;
}
