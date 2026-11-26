import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { isFullyPaid, valorPago, saldoExigivel, fimDoMesISO } from "@/utils/clientUtils";
import { stringToDate } from "@/utils/dates";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function parseData(s: string): Date | null {
  if (!s) return null;
  if (s.includes("/")) {
    const [d, m, y] = s.split("/").map(Number);
    return new Date(y, m - 1, d);
  }
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

const dd = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/** Detalhe da receita do mês: o que entrou e o que falta receber dos trabalhos do mês.
 *  Lê direto dos contextos (clientes + transações), então reflete qualquer atualização. */
export function ReceitaMesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clients } = useClients();
  const { transactions } = useTransactions();

  const { recebidos, totalRecebido, faltam, totalFalta, prazo, totalPrazo, sem, totalSem } = useMemo(() => {
    const now = new Date();
    const doMes = (d: Date | null) =>
      !!d && !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

    const recebidos = transactions
      .filter(t => t.type === "entrada" && doMes(parseData(t.date)))
      .map(t => ({ id: t.id, data: parseData(t.date) as Date, desc: t.description || t.category, valor: Number(t.amount) || 0 }))
      .sort((a, b) => b.data.getTime() - a.data.getTime());
    const totalRecebido = recebidos.reduce((s, r) => s + r.valor, 0);

    const ate = fimDoMesISO();
    const linhas = clients
      .filter(c => (c.status === "fechado" || c.status === "projeto_finalizado") && !isFullyPaid(c))
      .map(c => {
        const d = c.weddingDate ? stringToDate(c.weddingDate) : null;
        const { exigivel, aVencer, semParcela } = saldoExigivel(c, ate);
        return { id: c.id, nome: c.coupleName || c.name, data: d, contrato: c.contractValue || 0, pago: valorPago(c), falta: exigivel, aVencer, semParcela };
      });
    const faltam = linhas.filter(x => x.falta > 0).sort((a, b) => (a.data?.getTime() ?? 0) - (b.data?.getTime() ?? 0));
    const totalFalta = faltam.reduce((s, x) => s + x.falta, 0);
    const prazo = linhas.filter(x => x.aVencer > 0).sort((a, b) => (a.data?.getTime() ?? 0) - (b.data?.getTime() ?? 0));
    const sem = linhas.filter(x => x.semParcela > 0).sort((a, b) => b.semParcela - a.semParcela);
    const totalSem = sem.reduce((s, x) => s + x.semParcela, 0);
    const totalPrazo = prazo.reduce((s, x) => s + x.aVencer, 0);

    return { recebidos, totalRecebido, faltam, totalFalta, prazo, totalPrazo, sem, totalSem };
  }, [clients, transactions]);

  const sec: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#9A9590", textTransform: "uppercase", letterSpacing: 0.5, margin: "4px 0 8px" };
  const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #F0EEEA", fontSize: 13 };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Receita do mês</DialogTitle></DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-3">
          <div style={sec}>Recebido · {fmt(totalRecebido)}</div>
          {recebidos.length === 0 && <div style={{ ...row, color: "#9A9590" }}>Nenhuma entrada este mês</div>}
          {recebidos.map(r => (
            <div key={r.id} style={row}>
              <span><span style={{ color: "#9A9590" }}>{dd(r.data)}</span> · {r.desc}</span>
              <b style={{ color: "#52C97A", whiteSpace: "nowrap" }}>{fmt(r.valor)}</b>
            </div>
          ))}

          <div style={{ ...sec, marginTop: 18 }}>A receber (vencido ou do mês) · {fmt(totalFalta)}</div>
          {faltam.length === 0 && <div style={{ ...row, color: "#9A9590" }}>Nada vencido a receber</div>}
          {faltam.map(x => (
            <div key={x.id} style={row}>
              <span>
                {x.data && <span style={{ color: "#9A9590" }}>{dd(x.data)} · </span>}{x.nome}
                <div style={{ fontSize: 11, color: "#9A9590" }}>contrato {fmt(x.contrato)} · pago {fmt(x.pago)}</div>
              </span>
              <b style={{ color: "#E0A052", whiteSpace: "nowrap" }}>{fmt(x.falta)}</b>
            </div>
          ))}

          {prazo.length > 0 && (
            <>
              <div style={{ ...sec, marginTop: 18 }}>Com prazo combinado (não cobrado ainda) · {fmt(totalPrazo)}</div>
              {prazo.map(x => (
                <div key={x.id} style={row}>
                  <span>{x.nome}</span>
                  <b style={{ color: "#9A9590", whiteSpace: "nowrap" }}>{fmt(x.aVencer)}</b>
                </div>
              ))}
            </>
          )}

          {sem.length > 0 && (
            <>
              <div style={{ ...sec, marginTop: 18 }}>Saldo sem parcela e sem data do evento (conferir) · {fmt(totalSem)}</div>
              {sem.map(x => (
                <div key={x.id} style={row}>
                  <span>{x.nome}<div style={{ fontSize: 11, color: "#9A9590" }}>contrato {fmt(x.contrato)} · pago {fmt(x.pago)}</div></span>
                  <b style={{ color: "#9A9590", whiteSpace: "nowrap" }}>{fmt(x.semParcela)}</b>
                </div>
              ))}
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
