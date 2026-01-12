import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Calendar, CheckCircle2, Clock, Building2, User } from "lucide-react";
import { useBusinessFixedExpenses, BusinessFixedExpense } from "@/hooks/useBusinessFixedExpenses";
import { usePersonalFixedExpenses, PersonalFixedExpense } from "@/hooks/usePersonalFixedExpenses";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface ExpenseAlert {
  id: string;
  description: string;
  amount: number;
  dueDate: number;
  type: 'business' | 'personal';
  status: 'overdue' | 'today' | 'upcoming' | 'later';
  daysRemaining: number;
}

export function FixedExpensesAlerts() {
  const { getActiveExpenses: getBusinessExpenses, loading: loadingBusiness } = useBusinessFixedExpenses();
  const { getActiveExpenses: getPersonalExpenses, loading: loadingPersonal } = usePersonalFixedExpenses();

  const alerts = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    const mapExpenseToAlert = (
      expense: BusinessFixedExpense | PersonalFixedExpense,
      type: 'business' | 'personal'
    ): ExpenseAlert | null => {
      if (!expense.due_date) return null;

      let daysRemaining: number;
      let status: ExpenseAlert['status'];

      if (expense.due_date === currentDay) {
        daysRemaining = 0;
        status = 'today';
      } else if (expense.due_date < currentDay) {
        // Já passou neste mês
        daysRemaining = (daysInMonth - currentDay) + expense.due_date;
        status = 'later'; // Próximo vencimento será no próximo mês
      } else {
        daysRemaining = expense.due_date - currentDay;
        if (daysRemaining <= 3) {
          status = 'upcoming';
        } else if (daysRemaining <= 7) {
          status = 'upcoming';
        } else {
          status = 'later';
        }
      }

      return {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        dueDate: expense.due_date,
        type,
        status,
        daysRemaining
      };
    };

    const businessAlerts = getBusinessExpenses()
      .map(e => mapExpenseToAlert(e, 'business'))
      .filter((a): a is ExpenseAlert => a !== null);

    const personalAlerts = getPersonalExpenses()
      .map(e => mapExpenseToAlert(e, 'personal'))
      .filter((a): a is ExpenseAlert => a !== null);

    return [...businessAlerts, ...personalAlerts]
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [getBusinessExpenses, getPersonalExpenses]);

  const upcomingAlerts = alerts.filter(a => a.status === 'today' || a.status === 'upcoming');
  const totalUpcoming = upcomingAlerts.reduce((sum, a) => sum + a.amount, 0);
  const totalBusiness = alerts.filter(a => a.type === 'business').reduce((sum, a) => sum + a.amount, 0);
  const totalPersonal = alerts.filter(a => a.type === 'personal').reduce((sum, a) => sum + a.amount, 0);

  const loading = loadingBusiness || loadingPersonal;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando despesas fixas...
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (alert: ExpenseAlert) => {
    switch (alert.status) {
      case 'today':
        return <Badge variant="destructive">Vence Hoje!</Badge>;
      case 'upcoming':
        return <Badge variant="default" className="bg-amber-500">Em {alert.daysRemaining} dias</Badge>;
      case 'later':
        return <Badge variant="outline">Dia {alert.dueDate}</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (alert: ExpenseAlert) => {
    switch (alert.status) {
      case 'today':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Contas a Pagar Este Mês
            </CardTitle>
            <CardDescription>
              Despesas fixas com vencimento próximo
            </CardDescription>
          </div>
          {upcomingAlerts.length > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {upcomingAlerts.length} urgente{upcomingAlerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              Empresarial
            </div>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalBusiness)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <User className="h-4 w-4" />
              Pessoal
            </div>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalPersonal)}</p>
          </div>
          <div className="text-center border-l">
            <p className="text-sm text-muted-foreground mb-1">Total Mensal</p>
            <p className="text-lg font-bold">{formatCurrency(totalBusiness + totalPersonal)}</p>
          </div>
        </div>

        {/* Lista de Alertas */}
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma despesa fixa cadastrada</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {alerts.map((alert) => (
                <div
                  key={`${alert.type}-${alert.id}`}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    alert.status === 'today' ? 'bg-destructive/10 border-destructive/50' :
                    alert.status === 'upcoming' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20' :
                    'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(alert)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{alert.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {alert.type === 'business' ? (
                            <><Building2 className="h-3 w-3 mr-1" />Empresa</>
                          ) : (
                            <><User className="h-3 w-3 mr-1" />Pessoal</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: dia {alert.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-red-600">
                      {formatCurrency(alert.amount)}
                    </span>
                    {getStatusBadge(alert)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
