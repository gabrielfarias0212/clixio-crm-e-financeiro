import type { Lanc } from "./api";

export type Sinal = "ok" | "atencao" | "erro";
export interface Achado { sinal: Sinal; texto: string }
export interface ConferenciaFatura {
  fatura: any;
  fonteNome: string;
  somaLancamentos: number; // compras realizadas − estornos
  somaProjetados: number;
  qtdReais: number;
  qtdProjetados: number;
  achados: Achado[];
  sinal: Sinal;
}
export interface ParcelaFutura { descricao: string; restantes: number; total: number; ate: string; estornada: boolean }

const r2 = (n: number) => Math.round(n * 100) / 100;
const TOL = 0.05;
const ordem: Record<Sinal, number> = { ok: 0, atencao: 1, erro: 2 };
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Confere cada fatura de cartão consigo mesma (lançamentos × total × pagamento × status). Só avisa, não corrige. */
export function conferirFaturas(faturas: any[], lancs: Lanc[], hoje = new Date().toISOString().slice(0, 10)): ConferenciaFatura[] {
  const porFatura = new Map<string, Lanc[]>();
  for (const l of lancs) { if (!l.fatura_id) continue; const a = porFatura.get(l.fatura_id) ?? []; a.push(l); porFatura.set(l.fatura_id, a); }
  const porId = new Map(lancs.map((l) => [l.id, l]));

  return faturas.map((f) => {
    const ls = porFatura.get(f.id) ?? [];
    const reais = ls.filter((l) => l.status === "realizado");
    const proj = ls.filter((l) => l.status === "projetado");
    const compras = reais.filter((l) => l.tipo === "saida").reduce((a, l) => a + Number(l.valor), 0);
    const estornos = reais.filter((l) => l.tipo === "estorno").reduce((a, l) => a + Number(l.valor), 0);
    const somaLancamentos = r2(compras - estornos);
    const somaProjetados = r2(proj.reduce((a, l) => a + Number(l.valor), 0));
    const total = Number(f.valor_total);
    const achados: Achado[] = [];

    // 1. Soma × total
    if (reais.length > 0) {
      const dif = r2(total - somaLancamentos);
      if (Math.abs(dif) > TOL) achados.push({ sinal: "erro", texto: `Os lançamentos somam ${brl(somaLancamentos)}, mas o total da fatura é ${brl(total)} (diferença de ${brl(dif)}).` });
    } else if (proj.length > 0) {
      const dif = r2(total - somaProjetados);
      if (Math.abs(dif) > TOL) achados.push({ sinal: "erro", texto: `As parcelas previstas somam ${brl(somaProjetados)}, mas o total da fatura é ${brl(total)}.` });
    }

    // 2. Fatura × pagamento
    const pago = f.valor_pago == null ? null : Number(f.valor_pago);
    const lancPag = f.pagamento_lancamento_id ? porId.get(f.pagamento_lancamento_id) : undefined;
    if (f.status === "paga") {
      if (pago == null) achados.push({ sinal: "atencao", texto: "Marcada como paga, mas sem valor pago registrado." });
      else if (Math.abs(pago - total) > TOL) achados.push({ sinal: "erro", texto: `Paga com ${brl(pago)}, mas o total da fatura é ${brl(total)}.` });
      if (!lancPag) achados.push({ sinal: "atencao", texto: "Não está ligada a nenhum pagamento da conta." });
      else if (pago != null && Math.abs(Number(lancPag.valor) - pago) > TOL) achados.push({ sinal: "atencao", texto: `O pagamento ligado da conta é de ${brl(Number(lancPag.valor))}, diferente do valor pago (${brl(pago)}). Pode haver mais de um pagamento.` });
    }
    if (f.status === "parcial" && pago != null) achados.push({ sinal: "atencao", texto: `Parcial: pago ${brl(pago)} de ${brl(total)} (faltam ${brl(r2(total - pago))}).` });

    // 3. Status coerente
    const venceu = f.vencimento && String(f.vencimento) < hoje;
    if (venceu && (f.status === "fechada" || f.status === "aberta" || f.status === "vencida") && reais.length > 0)
      achados.push({ sinal: "atencao", texto: `Venceu em ${String(f.vencimento).split("-").reverse().join("/")} e não tem pagamento registrado.` });
    if (f.status === "parcial" && pago != null && Math.abs(pago - total) <= TOL)
      achados.push({ sinal: "erro", texto: "Marcada como parcial, mas o valor pago já cobre o total." });

    // 4. Projetados antigos
    if (proj.length > 0 && reais.length > 0)
      achados.push({ sinal: "erro", texto: `Tem ${proj.length} parcela(s) projetada(s) (${brl(somaProjetados)}) junto com lançamentos reais: provável contagem dupla.` });
    else if (proj.length > 0 && venceu)
      achados.push({ sinal: "atencao", texto: "Fatura já venceu e só tem parcelas projetadas: falta importar a fatura real." });

    const sinal = achados.reduce<Sinal>((m, a) => (ordem[a.sinal] > ordem[m] ? a.sinal : m), "ok");
    return { fatura: f, fonteNome: f.fin_fontes?.nome ?? "", somaLancamentos, somaProjetados, qtdReais: reais.length, qtdProjetados: proj.length, achados, sinal };
  });
}

/** Parcelas que ainda serão cobradas, agrupadas por compra. */
export function parcelasFuturas(lancs: Lanc[], faturas: any[]): ParcelaFutura[] {
  const comp = new Map(faturas.map((f) => [f.id, String(f.competencia).slice(0, 7)]));
  const g = new Map<string, ParcelaFutura>();
  for (const l of lancs) {
    if (l.status !== "projetado" || l.tipo !== "saida") continue;
    const k = `${l.descricao}|${l.parcela_total ?? ""}|${Number(l.valor)}`;
    const mes = (l.fatura_id && comp.get(l.fatura_id)) || l.data.slice(0, 7);
    const x = g.get(k) ?? { descricao: l.descricao, restantes: 0, total: 0, ate: mes, estornada: false };
    x.restantes += 1; x.total = r2(x.total + Number(l.valor));
    if (mes > x.ate) x.ate = mes;
    if (/estornad/i.test(l.obs ?? "")) x.estornada = true;
    g.set(k, x);
  }
  return [...g.values()].sort((a, b) => b.total - a.total);
}
