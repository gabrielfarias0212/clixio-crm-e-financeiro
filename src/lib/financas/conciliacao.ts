import type { Lanc } from "./api";

/** Transação de entrada do módulo Financeiro (wedding_transactions), só leitura. */
export interface TxClixio { id: string; date: string; amount: number; description: string; client_id: string | null; payment_id: string | null; category: string }
export interface ClienteClixio { id: string; name: string; couple_name: string | null }

const STOP = new Set(["PIX", "RECEBIDO", "ENVIADO", "CP", "DE", "DA", "DO", "DAS", "DOS", "PAGAMENTO", "CLIENTE", "TRANSFERENCIA", "RECEBIDA", "LTDA", "EPP", "MEI", "PARCELA", "ENTRADA", "SALDO", "CASAMENTO", "CRIADO", "AUTOMATICAMENTE"]);
export const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
export const tokens = (s: string) => [...new Set(semAcento(s).replace(/[^A-Z ]/g, " ").split(/\s+/).filter((t) => t.length >= 3 && !STOP.has(t)))];
export const dias = (a: string, b: string) => Math.abs(Date.parse(a + "T00:00:00Z") - Date.parse(b + "T00:00:00Z")) / 86400000;

/** Nome "bate" quando 2+ palavras em comum, ou 1 palavra longa se o nome do Pix tem só 1 ou 2 palavras. */
export function nomeBate(descricaoPix: string, texto: string) {
  const a = tokens(descricaoPix), b = new Set(tokens(texto));
  const comuns = a.filter((t) => b.has(t));
  return { comuns, ok: comuns.length >= 2 || (a.length <= 2 && comuns.some((t) => t.length >= 5)) };
}

export type Nivel = "alta" | "duvida" | "sem_par";
export interface SugestaoPix { lanc: Lanc; nivel: Nivel; candidatos: { tx: TxClixio; cliente: string; dias: number; nome: boolean }[] }

/** Compara cada Pix recebido (entrada do extrato) com as entradas do Clixio. Nunca decide sozinho: só sugere. */
export function sugerirPix(pix: Lanc[], txs: TxClixio[], clientes: ClienteClixio[], recusados: Set<string>): SugestaoPix[] {
  const nomeCliente = new Map(clientes.map((c) => [c.id, `${c.name}${c.couple_name ? " " + c.couple_name : ""}`]));
  const usados = new Set<string>();
  const out: SugestaoPix[] = [];
  for (const l of [...pix].sort((a, b) => (a.data < b.data ? -1 : 1))) {
    const cands = txs
      .filter((t) => !usados.has(t.id) && !recusados.has(`${l.id}|${t.id}`) && Math.abs(t.amount - l.valor) < 0.005)
      .map((t) => {
        const cliente = t.client_id ? nomeCliente.get(t.client_id) ?? "" : "";
        return { tx: t, cliente, dias: dias(l.data, t.date), nome: nomeBate(l.descricao, `${t.description} ${cliente}`).ok };
      })
      .filter((c) => (c.dias <= 3) || (c.nome && c.dias <= 30))
      .sort((a, b) => Number(b.nome) - Number(a.nome) || a.dias - b.dias);
    const fortes = cands.filter((c) => c.nome && c.dias <= 3);
    if (fortes.length === 1) { usados.add(fortes[0].tx.id); out.push({ lanc: l, nivel: "alta", candidatos: [fortes[0]] }); }
    else if (cands.length) out.push({ lanc: l, nivel: "duvida", candidatos: cands.slice(0, 4) });
    else out.push({ lanc: l, nivel: "sem_par", candidatos: [] });
  }
  return out;
}

export interface ParTransf { saida: Lanc; entrada: Lanc; nivel: "alta" | "duvida" }
/** Pares de movimentação entre contas suas: mesmo valor, sentidos opostos, fontes diferentes, até 1 dia. */
export function sugerirTransferencias(contas: Lanc[], titular: string[], recusados: Set<string>): ParTransf[] {
  const nomeTitular = (l: Lanc) => { const t = new Set(tokens(l.descricao)); return titular.every((x) => t.has(x)); };
  const livres = contas.filter((l) => !l.par_id && (l.tipo === "saida" || l.tipo === "entrada"));
  const usados = new Set<string>(), pares: ParTransf[] = [];
  for (const s of livres.filter((l) => l.tipo === "saida").sort((a, b) => (a.data < b.data ? -1 : 1))) {
    const cands = livres.filter((e) => e.tipo === "entrada" && !usados.has(e.id) && e.fonte_id !== s.fonte_id && Math.abs(e.valor - s.valor) < 0.005 && dias(e.data, s.data) <= 1 && !recusados.has(`${s.id}|${e.id}`));
    if (!cands.length) continue;
    const e = cands.find((c) => nomeTitular(c) || nomeTitular(s)) ?? cands[0];
    usados.add(e.id); usados.add(s.id);
    pares.push({ saida: s, entrada: e, nivel: nomeTitular(e) || nomeTitular(s) ? "alta" : "duvida" });
  }
  return pares;
}

export interface FaturaLista { id: string; fonte_id: string; competencia: string; vencimento: string | null; valor_total: number; status: string; pagamento_lancamento_id: string | null; fin_fontes?: { nome: string; banco: string } }
export interface SugestaoFatura { lanc: Lanc; fatura: FaturaLista | null; nivel: Nivel; diferenca: number }
/** Pagamento de fatura que aparece no extrato -> fatura do cartão do mesmo banco com o mesmo valor. */
export function sugerirPagamentosFatura(pagamentos: Lanc[], faturas: FaturaLista[], bancoDaFonte: Map<string, string>, recusados: Set<string>): SugestaoFatura[] {
  const usadas = new Set(faturas.filter((f) => f.pagamento_lancamento_id).map((f) => f.id));
  return pagamentos.sort((a, b) => (a.data < b.data ? -1 : 1)).map((l) => {
    const banco = bancoDaFonte.get(l.fonte_id);
    const doBanco = faturas.filter((f) => !usadas.has(f.id) && f.fin_fontes?.banco === banco && !recusados.has(`${l.id}|${f.id}`) && f.vencimento && dias(l.data, f.vencimento) <= 45);
    const exata = doBanco.filter((f) => Math.abs(f.valor_total - l.valor) < 0.01).sort((a, b) => dias(l.data, a.vencimento!) - dias(l.data, b.vencimento!))[0];
    if (exata) { usadas.add(exata.id); return { lanc: l, fatura: exata, nivel: "alta" as Nivel, diferenca: 0 }; }
    const perto = doBanco.filter((f) => Math.abs(f.valor_total - l.valor) <= Math.max(15, f.valor_total * 0.15)).sort((a, b) => Math.abs(a.valor_total - l.valor) - Math.abs(b.valor_total - l.valor))[0];
    return perto ? { lanc: l, fatura: perto, nivel: "duvida" as Nivel, diferenca: l.valor - perto.valor_total } : { lanc: l, fatura: null, nivel: "sem_par" as Nivel, diferenca: 0 };
  });
}
