import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client, AlertItem } from "@/utils/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock } from "lucide-react";
import { formatDate } from "@/utils/dates";

interface DashboardCardModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  clients: Client[];
  type: "leads" | "contracts" | "delivered" | "pending" | "monthly-events";
  customData?: AlertItem[];
}

// Format YYYY-MM-DD or DD/MM/YYYY safely without timezone shift
function safeFormatPaymentDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function PaymentStatusBadge({ alert }: { alert: AlertItem }) {
  const isOverdue =
    alert.isOverdue === true ||
    (alert.urgency === "high" && alert.title?.toLowerCase().includes("atrasado"));

  if (isOverdue) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "#FCEBEB", color: "#A32D2D",
        borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600
      }}>
        <AlertTriangle size={11} /> Atrasado
      </span>
    );
  }
  if (alert.urgency === "high") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "#FFF4E5", color: "#B45309",
        borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600
      }}>
        <Clock size={11} /> Vence em breve
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "#EFF6FF", color: "#1D4ED8",
      borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600
    }}>
      <Clock size={11} /> Pendente
    </span>
  );
}

export function DashboardCardModal({
  title, open, onClose, clients, type, customData
}: DashboardCardModalProps) {

  const isPaymentAlerts = !!customData && customData.length > 0 &&
    customData.some(a => a.type === "payment" || a.type === "due_payment");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[860px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          {isPaymentAlerts ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Contato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customData!.map((alert, index) => {
                  const payment = alert.payment;
                  const dueDateStr = payment?.due_date
                    ? safeFormatPaymentDate(payment.due_date)
                    : safeFormatPaymentDate(alert.client?.weddingDate ?? null);
                  const amount = payment?.amount ?? 0;

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{alert.client?.name ?? "—"}</TableCell>
                      <TableCell>{dueDateStr}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(amount)}</TableCell>
                      <TableCell><PaymentStatusBadge alert={alert} /></TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {alert.client?.email && <div>{alert.client.email}</div>}
                          {alert.client?.phone && <div className="mt-1">{alert.client.phone}</div>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data do Evento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{formatDate(client.weddingDate)}</TableCell>
                    <TableCell>
                      <span className={
                        client.status === "orçamento enviado" || client.status === "primeiro_contato"
                          ? "text-gray-400 italic"
                          : "font-medium"
                      }>
                        {formatCurrency(client.contractValue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={client.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {client.email && <div>{client.email}</div>}
                        {client.phone && <div className="mt-1">{client.phone}</div>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum registro encontrado.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
