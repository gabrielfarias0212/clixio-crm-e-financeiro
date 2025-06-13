
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useProLabore } from "@/hooks/useProLabore";
import { WeekInfo } from "@/utils/dates/weekUtils";
import { toast } from "sonner";

interface ProLaboreCardProps {
  currentWeek: WeekInfo;
  weeklyBalance: number;
}

export function ProLaboreCard({ currentWeek, weeklyBalance }: ProLaboreCardProps) {
  const { availableAmount, isAlreadyWithdrawn, canWithdraw, withdrawProLabore } = useProLabore(
    currentWeek,
    weeklyBalance
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleWithdraw = () => {
    const success = withdrawProLabore();
    if (success) {
      toast.success(`Pró-labore de ${formatCurrency(availableAmount)} transferido para o controle pessoal!`);
    } else {
      toast.error('Não foi possível retirar o pró-labore');
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pró-Labore Semanal
          </CardTitle>
          {isAlreadyWithdrawn ? (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Retirado
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
            <p className="text-sm text-gray-600">Saldo da Semana</p>
            <p className={`text-lg font-bold ${weeklyBalance > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(weeklyBalance)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Pró-Labore (30%)</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(availableAmount)}
            </p>
          </div>
        </div>

        <div className="pt-2">
          {weeklyBalance <= 0 ? (
            <p className="text-sm text-gray-500 text-center">
              Pró-labore disponível apenas com saldo positivo na semana
            </p>
          ) : isAlreadyWithdrawn ? (
            <p className="text-sm text-gray-500 text-center">
              Pró-labore já retirado nesta semana. Próximo disponível na semana seguinte.
            </p>
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

        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Semana: {currentWeek.label}
        </div>
      </CardContent>
    </Card>
  );
}
