import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMes, mesAtual, noPeriodo, qtdMeses, rotuloPeriodo, type Periodo } from "@/lib/financas/periodo";

export function SeletorPeriodo({ valor, onChange }: { valor: Periodo | null; onChange: (p: Periodo | null) => void }) {
  const agora = mesAtual();
  const n = valor ? qtdMeses(valor) : 0;
  const mover = (k: number) => valor && onChange({ de: addMes(valor.de, k * n), ate: addMes(valor.ate, k * n) });
  const igual = (a: Periodo | null) => (a === null ? valor === null : !!valor && valor.de === a.de && valor.ate === a.ate);
  const atalhos: [string, Periodo | null][] = [
    ["Este mês", { de: agora, ate: agora }],
    ["Mês passado", { de: addMes(agora, -1), ate: addMes(agora, -1) }],
    ["3 meses", { de: addMes(agora, -2), ate: agora }],
    ["Ano", { de: `${agora.slice(0, 4)}-01`, ate: agora }],
    ["Tudo", null],
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <div className="flex items-center rounded-md border">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!valor} onClick={() => mover(-1)} aria-label="Anterior"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="min-w-[96px] px-2 text-center font-medium">{rotuloPeriodo(valor)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!valor || valor.ate >= agora} onClick={() => mover(1)} aria-label="Próximo"><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <select
        className="h-8 rounded-md border bg-background px-2 text-xs"
        value={atalhos.findIndex(([, p]) => igual(p))}
        onChange={(e) => { const i = Number(e.target.value); if (i >= 0) onChange(atalhos[i][1]); }}
        aria-label="Atalhos de período"
      >
        {atalhos.findIndex(([, p]) => igual(p)) < 0 && <option value={-1}>Personalizado</option>}
        {atalhos.map(([t], i) => <option key={t} value={i}>{t}</option>)}
      </select>
    </div>
  );
}
export { noPeriodo };
