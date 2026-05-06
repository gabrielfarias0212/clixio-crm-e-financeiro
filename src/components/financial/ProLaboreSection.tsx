import { formatDate } from '@/utils/dates';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, AlertCircle, TrendingUp, Calendar, TrendingDown, Undo2, Loader2 } from "lucide-react";
import { useProLabore } from "@/hooks/useProLabore";
import { useTransactions } from "@/contexts/TransactionsContext";
import { WeekInfo, getCurrentWeekInfo } from "@/utils/dates/weekUtils";
import { toast } from "sonner";
import { useState } from "react";

export function ProLaboreSection() {
  const [isReturning, setIsReturning] = useState<string | null>(null);
  
  // Usar uma semana fictícia já que agora é baseado no mês
  const currentWeek: WeekInfo = getCurrentWeekInfo();
  const weeklyBalance = 0; // Não usado mais
  
  const { 
    availableAmount, 
    monthlyIncomes,
    monthlyExpenses,
    monthlyBalance,
    totalProLabore, 
    alreadyWithdrawn, 
    canWithdraw, 
    withdrawProLabore,
    returnProLabore,
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

  const handleReturn = async (recordId: string) => {
    const record = currentMonthRecords.find(r => r.id === recordId);
    if (!record) {
      toast.error('Registro não encontrado');
      return;
    }

    setIsReturning(recordId);
    
    try {
      console.log('🚀 Iniciando processo de devolução...');
      
      // Mostrar toast de progresso
      toast.info('Processando devolução...', {
        duration: 2000
      });

      const success = await returnProLabore(recordId);
      
      if (success) {
        toast.success(`Pró-labore de ${formatCurrency(record.amount)} devolvido com sucesso!`, {
          description: 'As transações foram removidas do sistema'
        });
        
        // Forçar refresh das transações para mostrar as mudanças
        console.log('🔄 Atualizando transações...');
        await refreshTransactions();
        console.log('✅ Transações atualizadas');
      } else {
        toast.error('Não foi possível devolver o pró-labore', {
          description: 'Verifique os logs do console para mais detalhes'
        });
      }
    } catch (error) {
      console.error('❌ Erro no handleReturn:', error);
      toast.error('Erro inesperado durante a devolução');
    } finally {
      setIsReturning(null);
    }
  };

  const hasWithdrawals = currentMonthRecords.length > 0;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const isPositiveBalance = monthlyBalance > 0;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Gestão de Pró-Labore
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
          {/* Resumo Financeiro do Mês */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
            <div className="space-y-1 text-center">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Entradas
              </p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(monthlyIncomes)}
              </p>
            </div>
            
            <div className="space-y-1 text-center">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Saídas
              </p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(monthlyExpenses)}
              </p>
            </div>
            
            <div className="space-y-1 text-center">
              <p className="text-sm text-gray-600">Saldo</p>
              <p className={`text-lg font-bold ${isPositiveBalance ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyBalance)}
              </p>
            </div>
          </div>

          {/* Informações do Pró-Labore */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Pró-Labore Total (25% do saldo)</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(totalProLabore)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Disponível para Retirada</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(availableAmount)}
              </p>
            </div>
          </div>

          {hasWithdrawals && (
            <div className="pt-2 border-t">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Já Retirado Este Mês</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(alreadyWithdrawn)}
                </p>
              </div>
            </div>
          )}

          <div className="pt-2">
            {!isPositiveBalance ? (
              <div className="text-center space-y-2">
                <p className="text-sm text-red-500">
                  ⚠️ Saldo mensal negativo ou zero
                </p>
                <p className="text-xs text-gray-500">
                  Pró-labore disponível apenas com saldo positivo no mês
                </p>
              </div>
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

      {/* Histórico de Retiradas do Mês */}
      {hasWithdrawals && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retiradas do Mês Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentMonthRecords.map((record, index) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium">Retirada #{index + 1}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(record.date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {record.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(record.amount)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReturn(record.id)}
                      disabled={isReturning === record.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isReturning === record.id ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Devolvendo...
                        </>
                      ) : (
                        <>
                          <Undo2 className="h-3 w-3 mr-1" />
                          Devolver
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Informações adicionais */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-700">
                💡 <strong>Dica:</strong> A devolução remove as transações do sistema e restaura o saldo disponível.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Em caso de problemas, verifique o console do navegador (F12) para logs detalhados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
