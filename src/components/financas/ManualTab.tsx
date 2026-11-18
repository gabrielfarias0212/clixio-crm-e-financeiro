import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { arquivarFonte, criarFonte, criarLancamentoManual, listarFontes, type Categoria, type Fonte } from "@/lib/financas/api";

const hoje = () => new Date().toISOString().slice(0, 10);

export function ManualTab({ categorias, onMudou }: { categorias: Categoria[]; onMudou: () => void }) {
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const recarregar = () => listarFontes().then(setFontes).catch((e) => toast.error("Erro ao carregar fontes: " + e.message));
  useEffect(() => { recarregar(); }, []);

  // nova fonte
  const [nome, setNome] = useState(""); const [banco, setBanco] = useState(""); const [tipo, setTipo] = useState<"conta" | "cartao">("conta");
  const [pagador, setPagador] = useState<"PF" | "PJ">("PF"); const [fech, setFech] = useState(""); const [venc, setVenc] = useState("");
  async function salvarFonte() {
    if (!nome.trim() || !banco.trim()) return toast.error("Informe nome e banco");
    try {
      await criarFonte({ nome: nome.trim(), banco: banco.trim().toLowerCase(), tipo, pagador, dia_fechamento: tipo === "cartao" && fech ? +fech : null, dia_vencimento: tipo === "cartao" && venc ? +venc : null });
      toast.success("Fonte criada"); setNome(""); setBanco(""); setFech(""); setVenc(""); recarregar();
    } catch (e: any) { toast.error(e.message ?? String(e)); }
  }

  // lançamento manual
  const [fonteId, setFonteId] = useState(""); const [data, setData] = useState(hoje()); const [desc, setDesc] = useState("");
  const [valor, setValor] = useState(""); const [tp, setTp] = useState<"saida" | "entrada" | "transferencia" | "reembolso">("saida");
  const [dono, setDono] = useState<"PF" | "PJ" | "">(""); const [cat, setCat] = useState("");
  const fonte = fontes.find((f) => f.id === fonteId);
  async function salvarLanc() {
    const v = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (!fonte || !desc.trim() || !isFinite(v) || v <= 0) return toast.error("Preencha fonte, descrição e valor");
    try {
      await criarLancamentoManual({ fonte, data, descricao: desc.trim(), valor: v, tipo: tp, pertence_a: dono || fonte.pagador, categoria_id: cat || null });
      toast.success("Lançamento criado"); setDesc(""); setValor(""); onMudou();
    } catch (e: any) { toast.error(e.message ?? String(e)); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Fontes (contas e cartões)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y text-sm">
            {fontes.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2">
                <span>{f.nome} <span className="text-muted-foreground">· {f.banco} · {f.tipo} · {f.pagador}{f.tipo === "cartao" ? ` · fecha ${f.dia_fechamento ?? "?"}, vence ${f.dia_vencimento ?? "?"}` : ""}</span></span>
                <Button variant="ghost" size="sm" onClick={async () => { await arquivarFonte(f.id); recarregar(); }}>Arquivar</Button>
              </li>
            ))}
            {!fontes.length && <li className="py-2 text-muted-foreground">Nenhuma fonte ainda.</li>}
          </ul>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><Label>Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Nubank cartão (PF)" /></div>
            <div><Label>Banco (c6, inter, nubank…)</Label><Input value={banco} onChange={(e) => setBanco(e.target.value)} /></div>
            <div><Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="conta">Conta</SelectItem><SelectItem value="cartao">Cartão</SelectItem></SelectContent></Select></div>
            <div><Label>Quem paga</Label>
              <Select value={pagador} onValueChange={(v) => setPagador(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="PF">PF</SelectItem><SelectItem value="PJ">PJ</SelectItem></SelectContent></Select></div>
            {tipo === "cartao" && (<>
              <div><Label>Dia de fechamento</Label><Input type="number" min={1} max={31} value={fech} onChange={(e) => setFech(e.target.value)} /></div>
              <div><Label>Dia de vencimento</Label><Input type="number" min={1} max={31} value={venc} onChange={(e) => setVenc(e.target.value)} /></div>
            </>)}
          </div>
          <Button onClick={salvarFonte}>Adicionar fonte</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lançamento manual</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div><Label>Fonte</Label>
              <Select value={fonteId} onValueChange={setFonteId}><SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
                <SelectContent>{fontes.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Data</Label><Input type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
            <div><Label>Valor (R$)</Label><Input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" /></div>
            <div className="sm:col-span-3"><Label>Descrição</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <div><Label>Tipo</Label>
              <Select value={tp} onValueChange={(v) => setTp(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="saida">Saída</SelectItem><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="transferencia">Transferência</SelectItem><SelectItem value="reembolso">Reembolso</SelectItem></SelectContent></Select></div>
            <div><Label>Pertence a</Label>
              <Select value={dono || fonte?.pagador || "PF"} onValueChange={(v) => setDono(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="PF">PF</SelectItem><SelectItem value="PJ">PJ</SelectItem></SelectContent></Select></div>
            <div><Label>Categoria</Label>
              <Select value={cat} onValueChange={setCat}><SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger>
                <SelectContent>{categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <Button onClick={salvarLanc}>Adicionar lançamento</Button>
        </CardContent>
      </Card>
    </div>
  );
}
