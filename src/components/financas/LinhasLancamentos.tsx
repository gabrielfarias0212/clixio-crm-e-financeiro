import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { atualizarLancamento, type Categoria, type Lanc } from "@/lib/financas/api";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (d: string) => d.split("-").reverse().join("/");

function Linha({ l, categorias, onMudou }: { l: Lanc; categorias: Categoria[]; onMudou: () => void }) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(l.apelido ?? "");

  async function salvar(patch: Parameters<typeof atualizarLancamento>[1]) {
    try { await atualizarLancamento(l.id, patch); onMudou(); }
    catch (e: any) { toast.error("Erro: " + (e.message ?? e)); }
  }
  async function salvarNome() {
    setEditando(false);
    const n = nome.trim();
    if (n !== (l.apelido ?? "")) await salvar({ apelido: n || null });
  }
  const sinal = l.tipo === "estorno" ? -1 : 1;

  return (
    <div className="grid grid-cols-[84px_1fr_auto] items-center gap-x-3 gap-y-1 border-t py-2 text-sm first:border-t-0">
      <div className="text-xs text-muted-foreground">{dataBR(l.data)}</div>
      <div className="min-w-0">
        {editando ? (
          <Input autoFocus className="h-8" value={nome} placeholder="Ex.: Lente 24-70"
            onChange={(e) => setNome(e.target.value)} onBlur={salvarNome}
            onKeyDown={(e) => { if (e.key === "Enter") salvarNome(); if (e.key === "Escape") { setNome(l.apelido ?? ""); setEditando(false); } }} />
        ) : (
          <button type="button" className="group flex w-full items-center gap-1 text-left" onClick={() => setEditando(true)} title="Clique para dar um nome">
            <span className="truncate font-medium">{l.apelido || l.descricao}</span>
            <Pencil className="h-3 w-3 shrink-0 opacity-30 group-hover:opacity-100" />
          </button>
        )}
        {l.apelido && !editando && <div className="truncate text-xs text-muted-foreground">{l.descricao}</div>}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {l.parcela_total && l.parcela_total > 1 && l.parcela_atual && <Badge variant="outline">parcela {l.parcela_atual}/{l.parcela_total}</Badge>}
          {l.status === "projetado" && <Badge variant="secondary">projetado</Badge>}
          {l.tipo === "estorno" && <Badge variant="secondary">estorno</Badge>}
          <Badge variant="outline">pagou {l.pagador}</Badge>
          <button type="button" onClick={() => salvar({ pertence_a: l.pertence_a === "PF" ? "PJ" : "PF" })} title="Clique para alternar PF/PJ">
            <Badge variant={l.pertence_a !== l.pagador ? "destructive" : "secondary"}>é {l.pertence_a}</Badge>
          </button>
          <select className="h-6 rounded border bg-background px-1 text-xs" value={l.categoria_id ?? ""} onChange={(e) => salvar({ categoria_id: e.target.value || null })}>
            <option value="">sem categoria</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>
      <div className={"text-right tabular-nums " + (sinal < 0 ? "text-green-600" : "")}>{sinal < 0 ? "−" : ""}{brl(l.valor)}</div>
    </div>
  );
}

export function LinhasLancamentos({ lancs, categorias, onMudou }: { lancs: Lanc[]; categorias: Categoria[]; onMudou: () => void }) {
  const ordenados = [...lancs].sort((a, b) => (a.data < b.data ? 1 : -1));
  if (!ordenados.length) return <div className="py-2 text-sm text-muted-foreground">Nenhum lançamento nesta fatura.</div>;
  return <div>{ordenados.map((l) => <Linha key={l.id} l={l} categorias={categorias} onMudou={onMudou} />)}</div>;
}
