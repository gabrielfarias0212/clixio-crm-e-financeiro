import { parseC6Cartao } from "./parsers/c6Cartao";
import { parseC6Conta } from "./parsers/c6Conta";
import { parseInterCartao } from "./parsers/interCartao";
import { parseInterConta } from "./parsers/interConta";
import { limparDocumentos } from "./mask";
import { projetarParcelas } from "./faturas";
import type { LinhaCartao, LinhaConta } from "./parsers/types";

export type Layout = "c6_cartao" | "c6_conta" | "inter_cartao" | "inter_conta";
export const ehCartao = (l: Layout) => l === "c6_cartao" || l === "inter_cartao";
export const BANCO: Record<Layout, "c6" | "inter"> = { c6_cartao: "c6", c6_conta: "c6", inter_cartao: "inter", inter_conta: "inter" };

export function detectarLayout(text: string): Layout | null {
  const t = text.replace(/^﻿/, "");
  if (/^Data de Compra;/m.test(t)) return "c6_cartao";
  if (/^Data Lançamento,/m.test(t)) return "c6_conta";
  if (/^"Data","Lançamento"/m.test(t)) return "inter_cartao";
  if (/^Data Lançamento;/m.test(t)) return "inter_conta";
  return null;
}

export interface LancamentoNovo {
  data: string;
  descricao: string;
  descricao_original: string;
  valor: number;
  tipo: "entrada" | "saida" | "transferencia" | "pagamento_fatura" | "estorno";
  parcela_atual: number | null;
  parcela_total: number | null;
  status: "realizado" | "projetado";
  hash_dedupe: string;
  obs?: string | null;
  competencia?: string; // só para projetados: yyyy-mm-01 da fatura
}

export interface Preview {
  layout: Layout;
  lancamentos: LancamentoNovo[];
  totalLido: number; // cartão: total da fatura; conta: soma líquida
  saldoFinal: number | null;
  avisos: string[];
  ignorados: { descricao: string; valor: number }[]; // ex.: pagamento da fatura anterior que aparece no CSV do cartão
  ultimaData: string;
  cartaoLinhas?: LinhaCartao[];
}

/** Chave estável de "destino": agrupa compras do mesmo lugar/pessoa para a triagem e as regras. */
export function chaveDestino(rotulo: string): string {
  return rotulo
    .toUpperCase()
    .replace(/CP\s*:\s*\d+-?/g, "")
    .replace(/NO ESTABELECIMENTO/g, "")
    .replace(/PIX (ENVIADO PARA|RECEBIDO DE)/g, "")
    .replace(/\d+/g, "")
    .replace(/[^A-ZÀ-Ú* .&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function comOcorrencia(base: string, vistos: Map<string, number>) {
  const n = (vistos.get(base) ?? 0) + 1;
  vistos.set(base, n);
  return `${base}#${n}`; // linhas idênticas (ex.: 12 estornos iguais) continuam distintas
}

export function montarPreview(text: string, layout: Layout): Preview {
  const vistos = new Map<string, number>();
  const lancamentos: LancamentoNovo[] = [];

  if (ehCartao(layout)) {
    const r = layout === "c6_cartao" ? parseC6Cartao(text) : parseInterCartao(text);
    for (const l of r.linhas) {
      const rotulo = limparDocumentos(l.descricao);
      lancamentos.push({
        data: l.data, descricao: rotulo, descricao_original: l.descricao,
        valor: Math.abs(l.valor),
        tipo: l.valor < 0 ? "estorno" : "saida",
        parcela_atual: l.parcelaAtual, parcela_total: l.parcelaTotal, status: "realizado",
        // a parcela entra no hash: o Inter repete a data da compra original em todas as parcelas, então 11/12 e 12/12 seriam "iguais"
        hash_dedupe: comOcorrencia(`${BANCO[layout]}|cartao|${l.data}|${l.valor}|${l.descricao}${l.parcelaTotal && l.parcelaTotal > 1 ? `|p${l.parcelaAtual}/${l.parcelaTotal}` : ""}`, vistos),
        obs: l.iof ? `inclui IOF ${l.iof.toFixed(2)}` : l.tipo === "credito_a_confirmar" ? "crédito a confirmar" : null,
      });
    }
    const ignorados = "pagamentos" in r ? (r as any).pagamentos.map((p: LinhaCartao) => ({ descricao: p.descricao, valor: p.valor })) : [];
    const ultimaData = r.linhas.reduce((m, l) => (l.data > m ? l.data : m), "0000-00-00");
    return { layout, lancamentos, totalLido: r.total, saldoFinal: null, avisos: r.avisos, ignorados, ultimaData, cartaoLinhas: r.linhas };
  }

  const r = layout === "c6_conta" ? parseC6Conta(text) : parseInterConta(text);
  for (const l of r.linhas as LinhaConta[]) {
    const ehDebito = /DEBITO DE CARTAO|Compra no debito/i.test(l.titulo);
    const rotuloBruto = layout === "c6_conta" ? (ehDebito ? l.descricao : l.titulo) : l.descricao;
    const rotulo = limparDocumentos(rotuloBruto.replace(/^Cp\s*:\s*\d+-/i, "").replace(/^No estabelecimento\s*/i, ""));
    const tipo: LancamentoNovo["tipo"] =
      l.tipo === "pagamento_fatura" ? "pagamento_fatura" : l.tipo === "investimento" ? "transferencia" : l.sentido === "entrada" ? "entrada" : "saida";
    lancamentos.push({
      data: l.data, descricao: rotulo || limparDocumentos(l.titulo), descricao_original: limparDocumentos(`${l.titulo} | ${l.descricao}`),
      valor: l.valor, tipo, parcela_atual: null, parcela_total: null, status: "realizado",
      hash_dedupe: comOcorrencia(`${BANCO[layout]}|conta|${l.data}|${l.sentido}|${l.valor}|${l.titulo}|${l.descricao}`, vistos),
      obs: l.tipo === "investimento" ? "aplicação (neutra)" : null,
    });
  }
  const ultimaData = lancamentos.reduce((m, l) => (l.data > m ? l.data : m), "0000-00-00");
  return { layout, lancamentos, totalLido: r.total, saldoFinal: (r as any).saldoFinal ?? null, avisos: r.avisos, ignorados: [], ultimaData };
}

/** Mês de vencimento (yyyy-mm-01) da fatura, a partir da última compra e dos dias de fechamento/vencimento. */
export function competenciaPadrao(ultimaData: string, diaFechamento: number | null): string {
  const [y, m, d] = ultimaData.split("-").map(Number);
  let mes = m - 1;
  if (diaFechamento && d > diaFechamento) mes += 1;
  const dt = new Date(Date.UTC(y, mes, 1));
  return dt.toISOString().slice(0, 10);
}

export function vencimentoDe(competencia: string, diaVencimento: number | null): string {
  return competencia.slice(0, 8) + String(diaVencimento ?? 10).padStart(2, "0");
}

/** Parcelas futuras (status projetado). Estorno de compra inteira NÃO remove: só marca em `obs`. */
export function montarProjetados(p: Preview, competencia: string): LancamentoNovo[] {
  if (!p.cartaoLinhas) return [];
  return projetarParcelas(p.cartaoLinhas, competencia).map((x) => ({
    data: vencimentoDe(x.competencia, null),
    descricao: limparDocumentos(x.descricao), descricao_original: x.descricao, valor: r2(x.valor), tipo: "saida" as const,
    parcela_atual: x.parcela, parcela_total: x.total, status: "projetado" as const, competencia: x.competencia,
    hash_dedupe: `${BANCO[p.layout]}|proj|${x.competencia}|${x.descricao}|${x.parcela}/${x.total}|${x.valor}`,
    obs: x.estornada ? "compra estornada (crédito antecipado)" : null,
  }));
}

export interface Regra { padrao: string; categoria_id: string | null; pertence_a: "PF" | "PJ" | null }

export function aplicarRegra(rotulo: string, regras: Regra[]): Regra | null {
  const k = chaveDestino(rotulo);
  const ord = [...regras].sort((a, b) => b.padrao.length - a.padrao.length);
  return ord.find((r) => r.padrao && k.includes(r.padrao)) ?? null;
}
