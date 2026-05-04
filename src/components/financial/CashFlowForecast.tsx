import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, CalendarDays, DollarSign, AlertCircle } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { useBusinessFixedExpenses } from "@/hooks/useBusinessFixedExpenses";
import { addMonths, format, startOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const MEI_DAS = 75.9;
const MONTHS_AHEAD = 6;

interface MonthData {
  label: string;       // "Mai 2026"
  monthKey: string;    // "2026-05"
  receipts: ReceiptItem[];
  fixedExpenses: number;
  totalReceipts: number;
  netFlow: number;     // receipts - fixed expenses
}

interface ReceiptItem {
  clientName: string;
  clientId: string;
  amount: number;
  dueDate: string;     // DD/MM/YYYY
  notes?: string;
  status: string;
}

/** Parse DD/MM/YYYY → Date */
function parseBR(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  return new Date(y, m - 1, d);
}

export function CashFlowForecast() {
  const { clients } = useClients();
  const { getTotalMonthlyExpenses } = useBusinessFixedExpenses();
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const { months, totalPending, overdueAmount } = useMemo(() => {
    const fixedPerMonth = getTotalMonthlyExpenses() + MEI_DAS;
    const now = new Date();
    const today = startOfMonth(now);

    // Build 6-month buckets (current + 5 ahead)
    const buckets: Record<string, MonthData> = {};
    for (let i = 0; i < MONTHS_AHEAD; i++) {
      const d = addMonths(today, i);
      const key = format(d, "yyyy-MM");
      buckets[key] = {
        label: format(d, "MMM yyyy", { locale: ptBR }),
        monthKey: key,
        receipts: [],
        fixedExpenses: fixedPerMonth,
        totalReceipts: 0,
        netFlow: 0,
      };
    }

    let totalPending = 0;
    let overdueAmount = 0;

    clients.forEach((client) => {
      if (!client.payments?.length) return;
      client.payments.forEach((payment) => {
        if (payment.payment_status === "pago") return;
        if (!payment.due_date) return;

        const date = parseBR(payment.due_date);
        if (!date) return;

        const key = format(date, "yyyy-MM");
        totalPending += payment.amount;

        // Overdue = due_date before today
        if (date < now) {
          overdueAmount += payment.amount;
        }

        if (buckets[key]) {
          buckets[key].receipts.push({
            clientName: client.name,
            clientId: client.id,
            amount: payment.amount,
            dueDate: payment.due_date,
            notes: payment.notes,
            status: payment.payment_status ?? "pendente",
          });
          buckets[key].totalReceipts += payment.amount;
        }
      });
    });

    const months = Object.values(buckets).map((m) => ({
      ...m,
      receipts: m.receipts.sort((a, b) => {
        const da = parseBR(a.dueDate)?.getTime() ?? 0;
        const db = parseBR(b.dueDate)?.getTime() ?? 0;
        return da - db;
      }),
      netFlow: m.totalReceipts - m.fixedExpenses,
    }));

    return { months, totalPending, overdueAmount };
  }, [clients, getTotalMonthlyExpenses]);

  const toggle = (key: string) =>
    setExpandedMonth((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-xs text-muted-foreground">A receber (próx. 6 meses)</span>
            </div>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(totalPending)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              </div>
              <span className="text-xs text-muted-foreground">Em atraso</span>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{fmt(overdueAmount)}</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
                <CalendarDays className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <span className="text-xs text-muted-foreground">Despesas fixas/mês</span>
            </div>
            <p className="text-xl font-bold">{fmt(months[0]?.fixedExpenses ?? 0)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">incl. DAS MEI</p>
          </CardContent>
        </Card>
      </div>

      {/* Month rows */}
      <div className="space-y-2">
        {months.map((month) => {
          const isExpanded = expandedMonth === month.monthKey;
          const isPositive = month.netFlow > 0;
          const isNeutral = month.netFlow === 0;
          const isCurrentMonth = month.monthKey === format(new Date(), "yyyy-MM");

          return (
            <Card
              key={month.monthKey}
              className={`overflow-hidden transition-all ${isCurrentMonth ? "ring-1 ring-primary/40" : ""}`}
            >
              <button
                className="w-full text-left"
                onClick={() => toggle(month.monthKey)}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Month label */}
                  <div className="w-24 shrink-0">
                    <p className="font-semibold capitalize">{month.label}</p>
                    {isCurrentMonth && (
                      <span className="text-xs text-primary">Mês atual</span>
                    )}
                  </div>

                  {/* Bar */}
                  <div className="flex-1 relative h-6 rounded-full bg-muted overflow-hidden">
                    {month.totalReceipts > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-blue-400/70 dark:bg-blue-500/50 rounded-full"
                        style={{
                          width: `${Math.min(
                            (month.totalReceipts / Math.max(month.totalReceipts, month.fixedExpenses, 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    )}
                    {month.fixedExpenses > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 border-r-2 border-red-500"
                        style={{
                          left: `${Math.min(
                            (month.fixedExpenses / Math.max(month.totalReceipts, month.fixedExpenses, 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    )}
                  </div>

                  {/* Numbers */}
                  <div className="text-right shrink-0 w-32">
                    <p className="text-sm text-muted-foreground">
                      entradas: <span className="font-medium text-foreground">{fmt(month.totalReceipts)}</span>
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : isNeutral
                          ? "text-muted-foreground"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}{fmt(month.netFlow)}
                    </p>
                  </div>

                  {/* Trend icon + chevron */}
                  <div className="shrink-0 flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : isNeutral ? (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-2 bg-muted/20">
                  {month.receipts.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma parcela com vencimento neste mês.
                    </p>
                  ) : (
                    month.receipts.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{r.clientName}</p>
                          <p className="text-xs text-muted-foreground">
                            Vence {r.dueDate}
                            {r.notes ? ` · ${r.notes}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-700 dark:text-blue-400">{fmt(r.amount)}</p>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {r.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Fixed expenses summary */}
                  <div className="flex items-center justify-between text-sm pt-1 text-muted-foreground">
                    <span>(-) Despesas fixas estimadas</span>
                    <span className="text-red-600 font-medium">- {fmt(month.fixedExpenses)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
                    <span>Saldo líquido previsto</span>
                    <span className={month.netFlow >= 0 ? "text-green-600" : "text-red-600"}>
                      {fmt(month.netFlow)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Baseado nas parcelas pendentes com data de vencimento definida · Despesas fixas incluem DAS MEI (R$ 75,90)
      </p>
    </div>
  );
}
