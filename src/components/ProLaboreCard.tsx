
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { useProLabore } from "@/hooks/useProLabore";
import { useTransactions } from "@/contexts/TransactionsContext";
import { WeekInfo } from "@/utils/dates/weekUtils";
import { toast } from "sonner";

interface ProLaboreCardProps {
  currentWeek: WeekInfo;
  weeklyBalance: number;
}

export function ProLaboreCard({ currentWeek, weeklyBalance }: ProLaboreCardProps) {
  const { 
    availableAmount, 
    monthlyIncomes, 
    totalProLabore, 
    alreadyWithdrawn, 
    canWithdraw, 
    withdrawProLabore,
    currentMonthRecords 
  } = useProLabore(currentWeek, weeklyBalance);
  
  // Hook para forçar refresh das transações empresariais
  const { refreshTransactions } = useTransactions();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleWithdraw = async () => {
    const success = await withdrawProLabore();
    if (success) {
      toast.success(`Pró-labore de ${formatCurrency(availableAmount)} processado com sucesso!`);
      
      // Forçar refresh das transações empresariais para mostrar a nova transação de saída
      await refreshTransactions();
    } else {
      toast.error('Não foi possível retirar o pró-labore');
    }
  };

  const hasWithdrawals = currentMonthRecords.length > 0;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pró-Labore Mensal
          </CardTitle>
          {!canWithdraw && hasWithdrawals ? (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Retirado Totalmente
            </Badge>
          ) : canWithdraw ? (
            <Badge className="bg-green-100 text-green-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Disponível
            </Badge>
          ) : (
            <Badge variant="destructive" className="bg-red-100 text-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Indisponível
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Entradas do Mês</p>
            <p className={`text-lg font-bold ${monthlyIncomes > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {formatCurrency(monthlyIncomes)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Pró-Labore Total (25%)</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(totalProLabore)}
            </p>
          </div>
        </div>

        {hasWithdrawals && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Já Retirado</p>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(alreadyWithdrawn)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Disponível</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(availableAmount)}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2">
          {monthlyIncomes <= 0 ? (
            <p className="text-sm text-gray-500 text-center">
              Pró-labore disponível apenas com entradas no mês
            </p>
          ) : !canWithdraw && hasWithdrawals ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Pró-labore totalmente retirado neste mês ({currentMonthRecords.length} retirada{currentMonthRecords.length > 1 ? 's' : ''}).
              </p>
              <p className="text-xs text-blue-600">
                ✓ Valores debitados do fluxo empresarial e creditados no controle pessoal
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleWithdraw}
              disabled={!canWithdraw}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Retirar Pró-Labore ({formatCurrency(availableAmount)})
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center pt-2 border-t flex items-center justify-center gap-1">
          <Calendar className="h-3 w-3" />
          Mês: {currentMonth}
        </div>
      </CardContent>
    </Card>
  );
}
