import { supabase } from "@/integrations/supabase/client";
import type { LancamentoNovo, Preview, Regra } from "./importar";
import type { ClienteClixio, TxClixio } from "./conciliacao";
import { aplicarRegra, ehCartao, montarProjetados, vencimentoDe } from "./importar";

// As tabelas fin_* ainda não estão em integrations/supabase/types.ts (arquivo gerado); acesso sem tipos.
const db = supabase as any;

export interface Fonte { id: string; nome: string; banco: string; tipo: "conta" | "cartao"; pagador: "PF" | "PJ"; dia_fechamento: number | null; dia_vencimento: number | null }
export interface Categoria { id: string; nome: string; grupo: string }
export interface Lanc {
  id: string; fonte_id: string; fatura_id: string | null; data: string; descricao: string; valor: number;
  tipo: string; parcela_atual: number | null; parcela_total: number | null; pagador: "PF" | "PJ"; pertence_a: "PF" | "PJ"; categoria_id: string | null; status: string; obs: string | null; apelido: string | null;
  conciliado: boolean; clixio_transaction_id: string | null; clixio_match_status: "sugerido" | "confirmado" | "rejeitado" | null; par_id: string | null;
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
  const { data, error } = await db.from("fin_faturas").select("*, fin_fontes(nome,banco)").order("competencia", { ascending: false });
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

export async function atualizarLancamento(id: string, patch: Partial<Pick<Lanc, "apelido" | "categoria_id" | "pertence_a">>) {
  const { error } = await db.from("fin_lancamentos").update(patch).eq("id", id);
  if (error) throw error;
}

// ---------- Conciliação ----------
async function paginar<T>(consulta: (de: number, ate: number) => any): Promise<T[]> {
  const todos: T[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await consulta(de, de + 999);
    if (error) throw error;
    todos.push(...data);
    if (data.length < 1000) break;
  }
  return todos;
}
/** Somente leitura: entradas e clientes do módulo Financeiro. */
export async function carregarClixio(): Promise<{ txs: TxClixio[]; clientes: ClienteClixio[] }> {
  const [txs, clientes] = await Promise.all([
    paginar<any>((a, b) => db.from("wedding_transactions").select("id,date,amount,description,client_id,payment_id,category").eq("type", "entrada").order("date", { ascending: false }).range(a, b)),
    paginar<any>((a, b) => db.from("wedding_clients").select("id,name,couple_name").order("name").range(a, b)),
  ]);
  return { txs: txs.map((t) => ({ ...t, amount: Number(t.amount) })), clientes };
}
export async function vincularTransacao(lancId: string, txId: string, score: number) {
  const { error } = await db.from("fin_lancamentos").update({ clixio_transaction_id: txId, clixio_match_status: "confirmado", clixio_match_score: score, conciliado: true }).eq("id", lancId);
  if (error) throw error;
}
export async function marcarNaoEhCliente(lancId: string) {
  const { error } = await db.from("fin_lancamentos").update({ clixio_match_status: "rejeitado", clixio_transaction_id: null, conciliado: false }).eq("id", lancId);
  if (error) throw error;
}
/** Cria no Financeiro o pagamento do cliente + a transação de entrada (padrão do Clixio) e vincula. Desfaz o que criou se algo falhar. */
export async function registrarPagamentoCliente(l: Lanc, cliente: ClienteClixio, nota: string) {
  const user = (await supabase.auth.getUser()).data.user?.id;
  if (!user) throw new Error("Sem usuário autenticado");
  const { data: pag, error: e1 } = await db.from("wedding_payments").insert({
    client_id: cliente.id, amount: l.valor, date: l.data, payment_status: "pago", user_id: user,
    notes: `${nota ? nota + " · " : ""}Pix recebido: ${l.descricao} (registrado pela conciliação do módulo Finanças)`,
  }).select("id").single();
  if (e1) throw e1;
  const { data: tx, error: e2 } = await db.from("wedding_transactions").insert({
    amount: l.valor, date: l.data, type: "entrada", category: "casamento", client_id: cliente.id, payment_id: pag.id, user_id: user,
    description: `Pagamento — ${cliente.name}${cliente.couple_name ? ` (${cliente.couple_name})` : ""}`,
  }).select("id").single();
  if (e2) { await db.from("wedding_payments").delete().eq("id", pag.id); throw e2; }
  const { error: e3 } = await db.from("fin_lancamentos").update({ clixio_transaction_id: tx.id, clixio_match_status: "confirmado", clixio_match_score: 1, conciliado: true, obs: "pagamento criado no Clixio pela conciliação" }).eq("id", l.id);
  if (e3) { await db.from("wedding_transactions").delete().eq("id", tx.id); await db.from("wedding_payments").delete().eq("id", pag.id); throw e3; }
}
/** Desfaz um vínculo. Se o pagamento foi criado pela conciliação, remove também o que foi criado no Financeiro. */
export async function desfazerVinculo(l: Lanc) {
  if (l.obs === "pagamento criado no Clixio pela conciliação" && l.clixio_transaction_id) {
    const { data: tx } = await db.from("wedding_transactions").select("id,payment_id").eq("id", l.clixio_transaction_id).maybeSingle();
    if (tx) { await db.from("wedding_transactions").delete().eq("id", tx.id); if (tx.payment_id) await db.from("wedding_payments").delete().eq("id", tx.payment_id); }
  }
  const { error } = await db.from("fin_lancamentos").update({ clixio_transaction_id: null, clixio_match_status: null, clixio_match_score: null, conciliado: false, obs: l.obs === "pagamento criado no Clixio pela conciliação" ? null : l.obs }).eq("id", l.id);
  if (error) throw error;
}
export async function confirmarTransferencia(saidaId: string, entradaId: string) {
  const par = crypto.randomUUID();
  for (const [id, lado] of [[saidaId, "saida"], [entradaId, "entrada"]] as const) {
    const { error } = await db.from("fin_lancamentos").update({ tipo: "transferencia", par_id: par, obs: `transferência entre contas (neutra)|${lado}` }).eq("id", id);
    if (error) throw error;
  }
}
/** Entrada vinda de conta própria cuja outra ponta não foi importada: fica neutra (não conta como receita nova). */
export async function marcarTransferenciaPropria(ids: string[]) {
  const { error } = await db.from("fin_lancamentos").update({ tipo: "transferencia", obs: "transferência de conta própria (sem par importado)|entrada" }).in("id", ids);
  if (error) throw error;
}
export async function desfazerTransferencia(lados: Lanc[]) {
  for (const l of lados) {
    const tipo = l.obs?.endsWith("|entrada") ? "entrada" : "saida";
    const { error } = await db.from("fin_lancamentos").update({ tipo, par_id: null, obs: null }).eq("id", l.id);
    if (error) throw error;
  }
}
export async function vincularPagamentoFatura(l: Lanc, f: { id: string; valor_total: number }) {
  const total = Number(f.valor_total), parcial = l.valor + 0.01 < total;
  const { error: e1 } = await db.from("fin_faturas").update({ status: parcial ? "parcial" : "paga", pago_em: l.data, valor_pago: l.valor, pagamento_lancamento_id: l.id }).eq("id", f.id);
  if (e1) throw e1;
  const { error: e2 } = await db.from("fin_lancamentos").update({ conciliado: true }).eq("id", l.id);
  if (e2) throw e2;
}
