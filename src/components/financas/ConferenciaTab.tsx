import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { Lanc } from "@/lib/financas/api";
import { conferirFaturas, parcelasFuturas, type Sinal } from "@/lib/financas/conferencia";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const mesBr = (iso: string) => { const [y, m] = iso.slice(0, 7).split("-"); return `${m}/${y}`; };
const KEY = "clixio_fin_total_banco";

const COR: Record<Sinal, string> = { ok: "text-green-600", atencao: "text-amber-600", erro: "text-red-600" };
const ICONE = { ok: CheckCircle2, atencao: AlertTriangle, erro: XCircle } as const;
const ROTULO: Record<Sinal, string> = { ok: "Confere", atencao: "Atenção", erro: "Não confere" };

function lerTotais(): Record<string, string> { try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; } }

export function ConferenciaTab({ lancs, faturas }: { lancs: Lanc[]; faturas: any[] }) {
  const [aberta, setAberta] = useState<string | null>(null);
  const [totais, setTotais] = useState<Record<string, string>>(lerTotais);
  const [soProblemas, setSoProblemas] = useState(false);

  const itens = useMemo(() => conferirFaturas(faturas, lancs), [faturas, lancs]);
  const futuras = useMemo(() => parcelasFuturas(lancs, faturas), [lancs, faturas]);
  const resumo = useMemo(() => ({
    erro: itens.filter((i) => i.sinal === "erro").length,
    atencao: itens.filter((i) => i.sinal === "atencao").length,
    ok: itens.filter((i) => i.sinal === "ok").length,
  }), [itens]);
  const visiveis = soProblemas ? itens.filter((i) => i.sinal !== "ok") : itens;
  const totalFuturo = futuras.reduce((a, p) => a + p.total, 0);

  function guardar(id: string, v: string) {
    const novo = { ...totais, [id]: v };
    setTotais(novo);
    try { localStorage.setItem(KEY, JSON.stringify(novo)); } catch { /* sem storage */ }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-4 text-sm">
          <span className="text-red-600">● {resumo.erro} não conferem</span>
          <span className="text-amber-600">● {resumo.atencao} pedem atenção</span>
          <span className="text-green-600">● {resumo.ok} conferem</span>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => setSoProblemas((v) => !v)}>
            {soProblemas ? "Mostrar todas" : "Mostrar só problemas"}
          </Button>
          <p className="w-full text-xs text-muted-foreground">
            Só avisa, não corrige nada. Confere lançamentos × total × pagamento × status. Para conferir com o banco, digite o total que aparece no app dele.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {visiveis.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma fatura para mostrar.</p>}
        {visiveis.map((i) => {
          const f = i.fatura; const Icone = ICONE[i.sinal]; const id = f.id as string;
          const digitado = totais[id]?.replace(",", ".");
          const totalBanco = digitado ? Number(digitado) : null;
          const difBanco = totalBanco != null && !Number.isNaN(totalBanco) ? Math.round((totalBanco - Number(f.valor_total)) * 100) / 100 : null;
          const lista = lancs.filter((l) => l.fatura_id === id).sort((a, b) => b.data.localeCompare(a.data));
          return (
            <Card key={id}>
              <CardContent className="space-y-2 pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Icone className={`h-5 w-5 ${COR[i.sinal]}`} aria-label={ROTULO[i.sinal]} />
                  <div className="min-w-[10rem]">
                    <div className="text-sm font-medium">{i.fonteNome} · {mesBr(f.competencia)}</div>
                    <div className="text-xs text-muted-foreground">vence {String(f.vencimento).split("-").reverse().join("/")} · {f.status}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-base font-semibold tabular-nums">{brl(Number(f.valor_total))}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {i.qtdReais > 0 ? `lançamentos ${brl(i.somaLancamentos)}` : `previsto ${brl(i.somaProjetados)}`}
                    </div>
                  </div>
                </div>

                {i.achados.length > 0 && (
                  <ul className="space-y-1 text-xs">
                    {i.achados.map((a, k) => (
                      <li key={k} className={COR[a.sinal]}>{a.sinal === "erro" ? "✗" : "!"} {a.texto}</li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <label className="text-muted-foreground" htmlFor={`banco-${id}`}>Total no app do banco:</label>
                  <Input id={`banco-${id}`} className="h-7 w-28" inputMode="decimal" placeholder="0,00" value={totais[id] ?? ""} onChange={(e) => guardar(id, e.target.value)} />
                  {difBanco != null && (difBanco === 0
                    ? <Badge variant="outline" className="text-green-600">igual ao sistema</Badge>
                    : <Badge variant="outline" className="text-red-600">diferença de {brl(difBanco)}</Badge>)}
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setAberta(aberta === id ? null : id)}>
                    {aberta === id ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronRight className="mr-1 h-4 w-4" />}
                    ver lançamentos ({lista.length})
                  </Button>
                </div>

                {aberta === id && (
                  <div className="rounded-md border">
                    {lista.map((l) => (
                      <div key={l.id} className={"flex items-baseline gap-3 border-t px-2 py-1 text-xs first:border-t-0" + (l.status === "projetado" ? " opacity-60" : "")}>
                        <span className="w-12 text-muted-foreground">{l.data.split("-").reverse().slice(0, 2).join("/")}</span>
                        <span className="min-w-0 flex-1 truncate">{l.apelido || l.descricao}{l.parcela_total && l.parcela_total > 1 && l.parcela_atual ? ` (${l.parcela_atual}/${l.parcela_total})` : ""}</span>
                        <span className="text-muted-foreground">{l.tipo === "estorno" ? "estorno" : l.status === "projetado" ? "projetado" : ""}</span>
                        <span className="w-24 text-right tabular-nums">{l.tipo === "estorno" ? "−" : ""}{brl(Number(l.valor))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Parcelas que ainda serão cobradas</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          {futuras.length === 0 && <p className="text-muted-foreground">Nenhuma parcela futura.</p>}
          {futuras.map((p, k) => (
            <div key={k} className="flex flex-wrap items-baseline gap-2">
              <span>{p.descricao}</span>
              <span className="text-xs text-muted-foreground">{p.restantes} parcela(s) até {mesBr(p.ate)}{p.estornada ? " · compra estornada (crédito já dado)" : ""}</span>
              <span className="ml-auto tabular-nums">{brl(p.total)}</span>
            </div>
          ))}
          {futuras.length > 0 && <div className="flex border-t pt-2 font-medium"><span>Total já assumido</span><span className="ml-auto tabular-nums">{brl(totalFuturo)}</span></div>}
        </CardContent>
      </Card>
    </div>
  );
}
