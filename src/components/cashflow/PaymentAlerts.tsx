
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { stringToDate } from "@/utils/dateUtils";

interface PaymentAlertsProps {
  payments: Array<{
    id: string;
    amount: number;
    due_date?: string;
    payment_status?: string;
    notes?: string;
    clientName: string;
  }>;
}

export function PaymentAlerts({ payments }: PaymentAlertsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não definida";
    const date = stringToDate(dateString);
    return date ? date.toLocaleDateString('pt-BR') : "Data inválida";
  };

  const getStatusInfo = (payment: any) => {
    const today = new Date();
    const dueDate = payment.due_date ? stringToDate(payment.due_date) : null;
    
    if (payment.payment_status === "atrasado" || (dueDate && dueDate < today && payment.payment_status === "pendente")) {
      return {
        icon: AlertTriangle,
        color: "destructive",
        label: "Atrasado",
        priority: 1
      };
    }
    
    if (payment.payment_status === "pendente") {
      const daysDiff = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      if (daysDiff <= 7) {
        return {
          icon: Clock,
          color: "default",
          label: `Vence em ${daysDiff} dias`,
          priority: 2
        };
      }
      
      return {
        icon: CheckCircle,
        color: "secondary",
        label: "Pendente",
        priority: 3
      };
    }
    
    return {
      icon: CheckCircle,
      color: "secondary",
      label: "Indefinido",
      priority: 4
    };
  };

  const sortedPayments = payments
    .map(payment => ({
      ...payment,
      statusInfo: getStatusInfo(payment)
    }))
    .sort((a, b) => a.statusInfo.priority - b.statusInfo.priority)
    .slice(0, 10); // Mostrar apenas os 10 mais importantes

  if (sortedPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Alertas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Todos os pagamentos estão em dia! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Alertas de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedPayments.map((payment) => {
            const StatusIcon = payment.statusInfo.icon;
            return (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`h-4 w-4 ${
                    payment.statusInfo.color === "destructive" ? "text-red-500" :
                    payment.statusInfo.color === "default" ? "text-yellow-500" :
                    "text-green-500"
                  }`} />
                  <div>
                    <p className="font-medium">{payment.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {formatDate(payment.due_date)}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground">{payment.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(payment.amount)}</p>
                  <Badge variant={payment.statusInfo.color as any}>
                    {payment.statusInfo.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
