import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { importar, listarFontes, type Fonte } from "@/lib/financas/api";
import { BANCO, competenciaPadrao, detectarLayout, ehCartao, montarPreview, montarProjetados, type Preview } from "@/lib/financas/importar";
import { conferir, resumoProjecao } from "@/lib/financas/faturas";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const NOME_LAYOUT = { c6_cartao: "C6 · fatura do cartão", c6_conta: "C6 · extrato da conta", inter_cartao: "Inter · fatura do cartão", inter_conta: "Inter · extrato da conta" };

export function ImportarTab({ onImportado }: { onImportado: () => void }) {
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [arquivo, setArquivo] = useState<string>("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [fonteId, setFonteId] = useState<string>("");
  const [competencia, setCompetencia] = useState<string>(""); // yyyy-mm
  const [declarado, setDeclarado] = useState<string>("");
  const [aceitaDif, setAceitaDif] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { listarFontes().then(setFontes).catch((e) => toast.error("Erro ao carregar fontes: " + e.message)); }, []);

  const candidatas = useMemo(
    () => (preview ? fontes.filter((f) => f.banco === BANCO[preview.layout] && f.tipo === (ehCartao(preview.layout) ? "cartao" : "conta")) : []),
    [fontes, preview],
  );
  const fonte = fontes.find((f) => f.id === fonteId) ?? null;

  async function aoEscolher(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const layout = detectarLayout(text);
    if (!layout) { toast.error("Não reconheci o layout desse arquivo (C6/Inter, CSV)."); return; }
    const p = montarPreview(text, layout);
    setArquivo(file.name); setPreview(p); setDeclarado(""); setAceitaDif(false);
    const f = fontes.find((x) => x.banco === BANCO[layout] && x.tipo === (ehCartao(layout) ? "cartao" : "conta"));
    setFonteId(f?.id ?? "");
    if (ehCartao(layout)) setCompetencia(competenciaPadrao(p.ultimaData, f?.dia_fechamento ?? null).slice(0, 7));
  }

  const declaradoNum = declarado.trim() ? Number(declarado.replace(/\./g, "").replace(",", ".")) : null;
  const conf = preview && ehCartao(preview.layout) && declaradoNum !== null ? conferir(preview.totalLido, declaradoNum) : null;
  const bloqueado = !preview || !fonte || (ehCartao(preview.layout) && (!competencia || declaradoNum === null || (!!conf && !conf.ok && !aceitaDif)));
  const proj = preview && ehCartao(preview.layout) && competencia ? resumoProjecao(
    montarProjetados(preview, competencia + "-01").map((p) => ({ competencia: p.competencia!, descricao: p.descricao, parcela: p.parcela_atual!, total: p.parcela_total!, valor: p.valor, estornada: !!p.obs })),
  ) : null;

  async function confirmar() {
    if (!preview || !fonte) return;
    setSalvando(true);
    try {
      const r = await importar({ fonte, preview, nomeArquivo: arquivo, competencia: competencia ? competencia + "-01" : undefined, totalDeclarado: declaradoNum });
      toast.success(`${r.novos} lançamentos novos, ${r.repetidos} já existiam${r.projetados ? `, ${r.projetados} parcelas projetadas` : ""}.`);
      setPreview(null); setArquivo(""); onImportado();
    } catch (e: any) { toast.error("Falha ao importar: " + (e.message ?? e)); } finally { setSalvando(false); }
  }

  const contagem = preview ? preview.lancamentos.reduce<Record<string, number>>((m, l) => ((m[l.tipo] = (m[l.tipo] ?? 0) + 1), m), {}) : {};

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">1. Escolha o arquivo (CSV)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input type="file" accept=".csv,text/csv" onChange={(e) => aoEscolher(e.target.files?.[0])} />
          <p className="text-xs text-muted-foreground">Extrato ou fatura do C6 ou do Inter. O arquivo é lido no seu navegador; só as linhas confirmadas são gravadas.</p>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader><CardTitle className="text-base">2. Conferência</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{NOME_LAYOUT[preview.layout]}</Badge>
              <span>{preview.lancamentos.length} linhas</span>
              {Object.entries(contagem).map(([k, v]) => <Badge key={k} variant="outline">{k}: {v}</Badge>)}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Fonte</Label>
                <Select value={fonteId} onValueChange={setFonteId}>
                  <SelectTrigger><SelectValue placeholder={candidatas.length ? "Escolha" : "Cadastre a fonte antes"} /></SelectTrigger>
                  <SelectContent>{candidatas.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {ehCartao(preview.layout) ? (
                <div>
                  <Label>Fatura (mês do vencimento)</Label>
                  <Input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} />
                </div>
              ) : (
                <div className="text-sm self-end">
                  Saldo final do arquivo: <b>{preview.saldoFinal !== null ? brl(preview.saldoFinal) : "—"}</b>
                  <div className="text-xs text-muted-foreground">Compare com o saldo no app do banco.</div>
                </div>
              )}
            </div>

            {ehCartao(preview.layout) && (
              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm">Total lido no arquivo: <b>{brl(preview.totalLido)}</b></div>
                <div>
                  <Label>Total da fatura no app do banco (R$)</Label>
                  <Input inputMode="decimal" placeholder="ex.: 1.055,21" value={declarado} onChange={(e) => setDeclarado(e.target.value)} />
                </div>
                {conf && (conf.ok
                  ? <div className="text-sm text-green-700">✓ Bate com o app.</div>
                  : <div className="space-y-1 text-sm text-amber-700">
                      Diferença de <b>{brl(conf.diferenca)}</b>. Pode ser crédito aplicado a outra fatura ou juros após o fechamento.
                      <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={aceitaDif} onChange={(e) => setAceitaDif(e.target.checked)} /> Aceitar a diferença como ajuste</label>
                    </div>)}
                {preview.ignorados.length > 0 && (
                  <div className="text-xs text-muted-foreground">Fora do total (pagamento da fatura anterior): {preview.ignorados.map((i) => `${i.descricao} ${brl(Math.abs(i.valor))}`).join("; ")}</div>
                )}
                {proj && proj.total > 0 && (
                  <div className="text-xs text-muted-foreground">Parcelas futuras: {brl(proj.total)}{proj.estornadas > 0 && <> (das quais {brl(proj.estornadas)} de compra estornada, ainda cobradas pelo banco)</>}.</div>
                )}
              </div>
            )}
            {preview.avisos.map((a) => <div key={a} className="text-xs text-amber-700">⚠ {a}</div>)}

            <div className="max-h-56 overflow-auto rounded-md border text-xs">
              <table className="w-full">
                <tbody>
                  {preview.lancamentos.slice(0, 40).map((l) => (
                    <tr key={l.hash_dedupe} className="border-b last:border-0">
                      <td className="px-2 py-1 whitespace-nowrap">{l.data.split("-").reverse().join("/")}</td>
                      <td className="px-2 py-1">{l.descricao}{l.parcela_total ? ` (${l.parcela_atual}/${l.parcela_total})` : ""}</td>
                      <td className="px-2 py-1 text-right whitespace-nowrap">{l.tipo === "entrada" || l.tipo === "estorno" ? "+" : "−"}{brl(l.valor)}</td>
                      <td className="px-2 py-1 text-muted-foreground">{l.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={confirmar} disabled={bloqueado || salvando}>{salvando ? "Importando…" : "Importar"}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
