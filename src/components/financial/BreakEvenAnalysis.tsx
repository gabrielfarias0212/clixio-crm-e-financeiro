import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, Target, DollarSign, Camera, Wrench } from "lucide-react";
import { useBusinessFixedExpenses } from "@/hooks/useBusinessFixedExpenses";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { useClients } from "@/contexts/ClientsContext";
import { supabase } from "@/integrations/supabase/client";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface ProjectCostRow {
  client_id: string;
  amount: number;
}

export function BreakEvenAnalysis() {
  const { expenses, loading: loadingExpenses, getTotalMonthlyExpenses } = useBusinessFixedExpenses();
  const metrics = useBusinessMetrics();
  const { clients } = useClients();

  const [allCosts, setAllCosts] = useState<ProjectCostRow[]>([]);
  const [loadingCosts, setLoadingCosts] = useState(true);

  // Fetch all project costs (to compute avg variable cost per project)
  useEffect(() => {
    async function load() {
      setLoadingCosts(true);
      const { data, error } = await supabase
        .from("project_costs")
        .select("client_id, amount");
      if (!error && data) setAllCosts(data as ProjectCostRow[]);
      setLoadingCosts(false);
    }
    load();
  }, []);

  const analysis = useMemo(() => {
    // 1. Custos fixos mensais
    const fixedCosts = getTotalMonthlyExpenses();

    // 2. Ticket médio por evento
    const avgTicket =
      metrics.activeContracts > 0
        ? metrics.totalRevenue / metrics.activeContracts
        : 0;

    // 3. Custo variável médio por projeto (de project_costs)
    const projectsWithCosts = new Map<string, number>();
    allCosts.forEach(({ client_id, amount }) => {
      projectsWithCosts.set(client_id, (projectsWithCosts.get(client_id) ?? 0) + amount);
    });
    const totalVarCost = Array.from(projectsWithCosts.values()).reduce((a, b) => a + b, 0);
    const avgVarCost =
      projectsWithCosts.size > 0 ? totalVarCost / projectsWithCosts.size : 0;

    // 4. Margem de contribuição por evento
    const contributionMargin = avgTicket - avgVarCost;

    // 5. Ponto de equilíbrio
    const breakEven =
      contributionMargin > 0 ? fixedCosts / contributionMargin : null;

    // 6. Eventos no mês atual
    const now = new Date();
    const eventsThisMonth = clients.filter((c) => {
      if (!c.weddingDate) return false;
      const d = new Date(c.weddingDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // 7. Status
    let status: "danger" | "warning" | "ok" = "danger";
    if (breakEven !== null && eventsThisMonth >= breakEven) status = "ok";
    else if (breakEven !== null && eventsThisMonth >= breakEven * 0.7) status = "warning";

    return {
      fixedCosts,
      avgTicket,
      avgVarCost,
      contributionMargin,
      breakEven,
      eventsThisMonth,
      status,
      hasEnoughData: avgTicket > 0 && contributionMargin > 0,
    };
  }, [getTotalMonthlyExpenses, metrics, allCosts, clients]);

  if (loadingExpenses || loadingCosts) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">Calculando ponto de equilíbrio...</span>
        </CardContent>
      </Card>
    );
  }

  const progressPct =
    analysis.breakEven && analysis.breakEven > 0
      ? Math.min((analysis.eventsThisMonth / analysis.breakEven) * 100, 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className={
        analysis.status === "ok"
          ? "border-green-500/40 bg-green-50/30 dark:bg-green-950/20"
          : analysis.status === "warning"
          ? "border-yellow-500/40 bg-yellow-50/30 dark:bg-yellow-950/20"
          : "border-red-500/40 bg-red-50/30 dark:bg-red-950/20"
      }>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Ponto de Equilíbrio Mensal
              </CardTitle>
              <CardDescription className="mt-1">
                Quantos eventos você precisa fechar por mês para cobrir todos os custos
              </CardDescription>
            </div>
            {analysis.status === "ok" && (
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30 gap-1">
                <CheckCircle2 className="h-3 w-3" /> No azul
              </Badge>
            )}
            {analysis.status === "warning" && (
              <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 gap-1">
                <AlertTriangle className="h-3 w-3" /> Atenção
              </Badge>
            )}
            {analysis.status === "danger" && (
              <Badge className="bg-red-500/20 text-red-700 border-red-500/30 gap-1">
                <AlertTriangle className="h-3 w-3" /> Abaixo do ponto
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {!analysis.hasEnoughData ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Dados insuficientes para o cálculo</p>
                <p>Para calcular o ponto de equilíbrio, você precisa ter pelo menos:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Contratos fechados com valor registrado</li>
                  <li>Despesas fixas cadastradas</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Big number */}
              <div className="text-center py-2">
                <p className="text-5xl font-bold tabular-nums">
                  {analysis.breakEven !== null ? Math.ceil(analysis.breakEven) : "–"}
                </p>
                <p className="text-muted-foreground mt-1">
                  eventos/mês para cobrir os custos
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Este mês: <span className="font-semibold text-foreground">{analysis.eventsThisMonth} evento{analysis.eventsThisMonth !== 1 ? "s" : ""}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Meta: <span className="font-semibold text-foreground">{analysis.breakEven !== null ? Math.ceil(analysis.breakEven) : "–"}</span>
                  </span>
                </div>
                <Progress
                  value={progressPct}
                  className={`h-3 ${
                    analysis.status === "ok"
                      ? "[&>div]:bg-green-500"
                      : analysis.status === "warning"
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-red-500"
                  }`}
                />
                <p className="text-xs text-muted-foreground text-right">{progressPct.toFixed(0)}% da meta</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
                <DollarSign className="h-3.5 w-3.5 text-red-600" />
              </div>
              <span className="text-xs text-muted-foreground">Custos Fixos/mês</span>
            </div>
            <p className="text-lg font-bold">{fmt(analysis.fixedCosts)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">despesas fixas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-xs text-muted-foreground">Ticket Médio</span>
            </div>
            <p className="text-lg font-bold">{fmt(analysis.avgTicket)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              por evento ({metrics.activeContracts} contratos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
                <Wrench className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <span className="text-xs text-muted-foreground">Custo Variável Médio</span>
            </div>
            <p className="text-lg font-bold">{fmt(analysis.avgVarCost)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              por projeto (custos diretos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              </div>
              <span className="text-xs text-muted-foreground">Margem de Contribuição</span>
            </div>
            <p className="text-lg font-bold">{fmt(analysis.contributionMargin)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {analysis.avgTicket > 0
                ? `${((analysis.contributionMargin / analysis.avgTicket) * 100).toFixed(0)}% do ticket`
                : "por evento"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Como funciona: </span>
            Ponto de equilíbrio = Custos Fixos ÷ Margem de Contribuição por evento. A margem de
            contribuição é o que sobra do ticket médio após descontar os custos diretos de cada
            projeto (assistentes, combustível, alimentação etc.). Quanto maior a margem, menos
            eventos você precisa para pagar as contas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
