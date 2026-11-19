import { supabase } from "@/integrations/supabase/client";
import type { LancamentoNovo, Preview, Regra } from "./importar";
import { aplicarRegra, ehCartao, montarProjetados, vencimentoDe } from "./importar";

// As tabelas fin_* ainda não estão em integrations/supabase/types.ts (arquivo gerado); acesso sem tipos.
const db = supabase as any;

export interface Fonte { id: string; nome: string; banco: string; tipo: "conta" | "cartao"; pagador: "PF" | "PJ"; dia_fechamento: number | null; dia_vencimento: number | null }
export interface Categoria { id: string; nome: string; grupo: string }
export interface Lanc {
  id: string; fonte_id: string; fatura_id: string | null; data: string; descricao: string; valor: number;
  tipo: string; parcela_atual: number | null; parcela_total: number | null; pagador: "PF" | "PJ"; pertence_a: "PF" | "PJ"; categoria_id: string | null; status: string; obs: string | null;
}

export async function listarFontes(): Promise<Fonte[]> {
  const { data, error } = await db.from("fin_fontes").select("*").eq("ativa", true).order("created_at");
  if (error) throw error; return data;
}
export async function listarCategorias(): Promise<Categoria[]> {
  const { data, error } = await db.from("fin_categorias").select("*").order("nome");
  if (error) throw error; return data;
}
export async function listarRegras(): Promise<(Regra & { id: string })[]> {
  const { data, error } = await db.from("fin_regras").select("*");
  if (error) throw error; return data;
}
export async function listarLancamentos(): Promise<Lanc[]> {
  const todos: Lanc[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("fin_lancamentos").select("*").order("data", { ascending: false }).range(from, from + 999);
    if (error) throw error;
    todos.push(...data);
    if (data.length < 1000) break;
  }
  return todos;
}
export async function listarFaturas() {
  const { data, error } = await db.from("fin_faturas").select("*, fin_fontes(nome)").order("competencia", { ascending: false });
  if (error) throw error; return data as any[];
}

async function garantirFatura(fonte: Fonte, competencia: string, extra: Record<string, unknown> = {}) {
  const venc = vencimentoDe(competencia, fonte.dia_vencimento);
  const { data, error } = await db.from("fin_faturas")
    .upsert({ fonte_id: fonte.id, competencia, vencimento: venc, ...extra }, { onConflict: "fonte_id,competencia" })
    .select().single();
  if (error) throw error; return data;
}

async function inserirLote(linhas: Record<string, unknown>[]) {
  let novos = 0;
  for (let i = 0; i < linhas.length; i += 200) {
    const { data, error } = await db.from("fin_lancamentos")
      .upsert(linhas.slice(i, i + 200), { onConflict: "user_id,hash_dedupe", ignoreDuplicates: true }).select("id");
    if (error) throw error;
    novos += data.length;
  }
  return novos;
}

export interface ResultadoImport { total: number; novos: number; repetidos: number; projetados: number }

export async function importar(opts: {
  fonte: Fonte; preview: Preview; nomeArquivo: string; competencia?: string; totalDeclarado?: number | null;
}): Promise<ResultadoImport> {
  const { fonte, preview, nomeArquivo } = opts;
  const regras = await listarRegras();
  const user = (await supabase.auth.getUser()).data.user?.id;
  if (!user) throw new Error("Sem usuário autenticado");

  const { data: imp, error: e1 } = await db.from("fin_importacoes").insert({
    fonte_id: fonte.id, nome_arquivo: nomeArquivo, formato: "csv", layout_fingerprint: preview.layout,
    total_declarado: opts.totalDeclarado ?? null, total_lido: preview.totalLido, qtd_linhas: preview.lancamentos.length, enviado_ia: false,
  }).select().single();
  if (e1) throw e1;

  let faturaId: string | null = null;
  if (ehCartao(preview.layout) && opts.competencia) {
    const f = await garantirFatura(fonte, opts.competencia, {
      valor_total: opts.totalDeclarado ?? preview.totalLido, status: "fechada",
    });
    faturaId = f.id;
    // o real substitui o projetado desta fatura
    await db.from("fin_lancamentos").delete().eq("fonte_id", fonte.id).eq("fatura_id", faturaId).eq("status", "projetado");
  }

  const montar = (l: LancamentoNovo, fatura_id: string | null) => {
    const r = aplicarRegra(l.descricao, regras);
    return {
      user_id: user, fonte_id: fonte.id, importacao_id: imp.id, fatura_id,
      data: l.data, descricao: l.descricao, descricao_original: l.descricao_original, valor: l.valor, tipo: l.tipo,
      pagador: fonte.pagador, pertence_a: r?.pertence_a ?? fonte.pagador, categoria_id: r?.categoria_id ?? null,
      parcela_atual: l.parcela_atual, parcela_total: l.parcela_total, status: l.status, hash_dedupe: l.hash_dedupe, obs: l.obs ?? null,
    };
  };

  const novos = await inserirLote(preview.lancamentos.map((l) => montar(l, faturaId)));

  let projetados = 0;
  if (ehCartao(preview.layout) && opts.competencia) {
    const proj = montarProjetados(preview, opts.competencia);
    const porFatura = new Map<string, string>();
    for (const comp of new Set(proj.map((p) => p.competencia!))) {
      const f = await garantirFatura(fonte, comp, {}); // não sobrescreve valor/status existentes
      porFatura.set(comp, f.id);
    }
    projetados = await inserirLote(proj.map((p) => montar(p, porFatura.get(p.competencia!)!)));
    const fat = await db.from("fin_faturas").select("id,competencia").eq("fonte_id", fonte.id).gt("competencia", opts.competencia);
    for (const f of fat.data ?? []) {
      const { data: ls } = await db.from("fin_lancamentos").select("valor,tipo,status").eq("fatura_id", f.id);
      const soma = (ls ?? []).reduce((s: number, l: any) => s + (l.tipo === "estorno" ? -l.valor : l.valor), 0);
      await db.from("fin_faturas").update({ valor_total: Math.round(soma * 100) / 100 }).eq("id", f.id).eq("status", "aberta");
    }
  }
  return { total: preview.lancamentos.length, novos, repetidos: preview.lancamentos.length - novos, projetados };
}

export async function salvarRegra(padrao: string, categoria_id: string | null, pertence_a: "PF" | "PJ", ids: string[]) {
  const { error: e1 } = await db.from("fin_regras").insert({ padrao, categoria_id, pertence_a });
  if (e1) throw e1;
  for (let i = 0; i < ids.length; i += 200) {
    const { error } = await db.from("fin_lancamentos").update({ categoria_id, pertence_a }).in("id", ids.slice(i, i + 200));
    if (error) throw error;
  }
}

export async function marcarFatura(id: string, status: "paga" | "fechada", pagoEm: string | null, valorPago: number | null) {
  const { error } = await db.from("fin_faturas").update({ status, pago_em: pagoEm, valor_pago: valorPago }).eq("id", id);
  if (error) throw error;
}

export async function criarFonte(f: { nome: string; banco: string; tipo: "conta" | "cartao"; pagador: "PF" | "PJ"; dia_fechamento?: number | null; dia_vencimento?: number | null }) {
  const { error } = await db.from("fin_fontes").insert({ ...f, dia_fechamento: f.dia_fechamento ?? null, dia_vencimento: f.dia_vencimento ?? null });
  if (error) throw error;
}
export async function arquivarFonte(id: string) {
  const { error } = await db.from("fin_fontes").update({ ativa: false }).eq("id", id);
  if (error) throw error;
}
export async function criarLancamentoManual(l: {
  fonte: Fonte; data: string; descricao: string; valor: number; tipo: "entrada" | "saida" | "transferencia" | "reembolso";
  pertence_a: "PF" | "PJ"; categoria_id: string | null; obs?: string | null;
}) {
  const { error } = await db.from("fin_lancamentos").insert({
    fonte_id: l.fonte.id, data: l.data, descricao: l.descricao, descricao_original: l.descricao, valor: Math.abs(l.valor), tipo: l.tipo,
    pagador: l.fonte.pagador, pertence_a: l.pertence_a, categoria_id: l.categoria_id, status: "realizado", obs: l.obs ?? "lançamento manual",
  });
  if (error) throw error;
}

export async function criarCategoria(nome: string, grupo: string) {
  const { data, error } = await db.from("fin_categorias").insert({ nome, grupo }).select("*").single();
  if (error) throw error; return data as Categoria;
}
