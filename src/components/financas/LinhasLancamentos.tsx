import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { atualizarLancamento, type Categoria, type Lanc } from "@/lib/financas/api";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (d: string) => d.split("-").reverse().slice(0, 2).join("/");
const COLS = "grid grid-cols-[52px_minmax(0,1fr)_52px_150px_44px_56px_96px] items-center gap-x-3";

function Linha({ l, categorias, onMudou }: { l: Lanc; categorias: Categoria[]; onMudou: () => void }) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(l.apelido ?? "");

  async function salvar(patch: Parameters<typeof atualizarLancamento>[1]) {
    try { const n = await atualizarLancamento(l.id, patch); if (n > 0) toast.success(`Aplicado também a ${n} ${n === 1 ? "outra parcela" : "outras parcelas"} desta compra`); onMudou(); }
    catch (e: any) { toast.error("Erro: " + (e.message ?? e)); }
  }
  async function salvarNome() {
    setEditando(false);
    const n = nome.trim();
    if (n !== (l.apelido ?? "")) await salvar({ apelido: n || null });
  }
  const estorno = l.tipo === "estorno";
  const parcela = l.parcela_total && l.parcela_total > 1 && l.parcela_atual ? `${l.parcela_atual}/${l.parcela_total}` : "";
  const divergente = l.pertence_a !== l.pagador;

  return (
    <div className={COLS + " border-t py-1.5 text-sm" + (l.status === "projetado" ? " opacity-60" : "")}>
      <div className="text-xs text-muted-foreground">{dataBR(l.data)}</div>
      <div className="min-w-0">
        {editando ? (
          <Input autoFocus className="h-7" value={nome} placeholder="Ex.: Lente 24-70"
            onChange={(e) => setNome(e.target.value)} onBlur={salvarNome}
            onKeyDown={(e) => { if (e.key === "Enter") salvarNome(); if (e.key === "Escape") { setNome(l.apelido ?? ""); setEditando(false); } }} />
        ) : (
          <button type="button" className="group flex w-full items-center gap-1 text-left" onClick={() => setEditando(true)} title="Clique para dar um nome">
            <span className="truncate">{l.apelido || l.descricao}</span>
            <Pencil className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60" />
          </button>
        )}
        {l.apelido && !editando && <div className="truncate text-xs text-muted-foreground">{l.descricao}</div>}
        {(estorno || l.status === "projetado") && <div className="text-xs text-muted-foreground">{estorno ? "estorno" : "projetado"}</div>}
      </div>
      <div className="text-xs text-muted-foreground">{parcela}</div>
      <select className="h-7 w-full rounded border bg-background px-1 text-xs" value={l.categoria_id ?? ""} onChange={(e) => salvar({ categoria_id: e.target.value || null })}>
        <option value="">sem categoria</option>
        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <div className="text-xs text-muted-foreground">{l.pagador}</div>
      <button type="button" className={"rounded px-1.5 py-0.5 text-xs font-medium " + (divergente ? "bg-amber-100 text-amber-900" : "bg-muted")}
        onClick={() => salvar({ pertence_a: l.pertence_a === "PF" ? "PJ" : "PF" })} title="Clique para alternar PF/PJ">{l.pertence_a}</button>
      <div className={"text-right tabular-nums " + (estorno ? "text-green-700" : "")}>{estorno ? "−" : ""}{brl(l.valor)}</div>
    </div>
  );
}

export function LinhasLancamentos({ lancs, categorias, onMudou }: { lancs: Lanc[]; categorias: Categoria[]; onMudou: () => void }) {
  const ordenados = [...lancs].sort((a, b) => (a.data < b.data ? 1 : -1));
  if (!ordenados.length) return <div className="py-2 text-sm text-muted-foreground">Nenhum lançamento nesta fatura.</div>;
  return (
    <div>
      <div className={COLS + " pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"}>
        <div>Data</div><div>Descrição</div><div>Parc.</div><div>Categoria</div><div>Pagou</div><div>É de</div><div className="text-right">Valor</div>
      </div>
      {ordenados.map((l) => <Linha key={l.id} l={l} categorias={categorias} onMudou={onMudou} />)}
    </div>
  );
}
