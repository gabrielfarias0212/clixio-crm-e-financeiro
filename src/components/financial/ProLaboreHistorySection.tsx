
import { formatDate } from '@/utils/dates';
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Wallet, CheckCircle, AlertCircle, TrendingUp, Calendar, TrendingDown, Undo2, Loader2, History, DollarSign } from "lucide-react";
import { useProLaboreHistory, ProLaboreMonthData } from "@/hooks/useProLaboreHistory";
import { useTransactions } from "@/contexts/TransactionsContext";
import { toast } from "sonner";

export function ProLaboreHistorySection() {
  const [isReturning, setIsReturning] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<ProLaboreMonthData | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  const { getMonthsData, withdrawProLaboreForMonth, returnProLabore } = useProLaboreHistory();
  const { refreshTransactions } = useTransactions();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const monthsData = getMonthsData();
  const availableMonths = monthsData.filter(month => month.canWithdraw || month.records.length > 0);

  const handleWithdraw = async () => {
    if (!selectedMonth || !withdrawAmount) return;
    
    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > selectedMonth.availableAmount) {
      toast.error(`Valor deve ser entre R$ 0,01 e ${formatCurrency(selectedMonth.availableAmount)}`);
      return;
    }

    setIsWithdrawing(true);
    
    try {
      const success = await withdrawProLaboreForMonth(selectedMonth.monthKey, amount);
      if (success) {
        toast.success(`Pró-labore de ${formatCurrency(amount)} de ${selectedMonth.monthName} sacado com sucesso!`);
        setWithdrawAmount("");
        setSelectedMonth(null);
        await refreshTransactions();
      } else {
        toast.error('Não foi possível sacar o pró-labore');
      }
    } catch (error) {
      console.error('Erro ao sacar pró-labore:', error);
      toast.error('Erro inesperado ao sacar pró-labore');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleReturn = async (recordId: string, monthData: ProLaboreMonthData) => {
    const record = monthData.records.find(r => r.id === recordId);
    if (!record) {
      toast.error('Registro não encontrado');
      return;
    }

    setIsReturning(recordId);
    
    try {
      toast.info('Processando devolução...', { duration: 2000 });

      const success = await returnProLabore(recordId);
      
      if (success) {
        toast.success(`Pró-labore de ${formatCurrency(record.amount)} devolvido com sucesso!`);
        await refreshTransactions();
      } else {
        toast.error('Não foi possível devolver o pró-labore');
      }
    } catch (error) {
      console.error('❌ Erro no handleReturn:', error);
      toast.error('Erro inesperado durante a devolução');
    } finally {
      setIsReturning(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Pró-Labore (Últimos 12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableMonths.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pró-labore disponível nos últimos 12 meses</p>
              </div>
            ) : (
              availableMonths.map((monthData) => (
                <Card key={monthData.monthKey} className="border-l-4 border-l-blue-400">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{monthData.monthName}</h3>
                        <p className="text-sm text-gray-600">Mês: {monthData.monthKey}</p>
                      </div>
                      <div className="flex gap-2">
                        {monthData.canWithdraw && (
                          <Badge className="bg-green-100 text-green-700">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Disponível
                          </Badge>
                        )}
                        {monthData.records.length > 0 && (
                          <Badge variant="secondary">
                            {monthData.records.length} retirada{monthData.records.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Resumo Financeiro do Mês */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Entradas</p>
                        <p className="font-bold text-green-600">{formatCurrency(monthData.monthlyIncomes)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Saídas</p>
                        <p className="font-bold text-red-600">{formatCurrency(monthData.monthlyExpenses)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Saldo</p>
                        <p className={`font-bold ${monthData.monthlyBalance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(monthData.monthlyBalance)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Pró-Labore (25%)</p>
                        <p className="font-bold text-purple-600">{formatCurrency(monthData.totalProLabore)}</p>
                      </div>
                    </div>

                    {/* Informações de Retirada */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Já Retirado</p>
                        <p className="font-bold text-orange-600">{formatCurrency(monthData.alreadyWithdrawn)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Disponível</p>
                        <p className="font-bold text-green-600">{formatCurrency(monthData.availableAmount)}</p>
                      </div>
                    </div>

                    {/* Botão de Saque */}
                    {monthData.canWithdraw && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full mb-4 bg-green-600 hover:bg-green-700"
                            onClick={() => setSelectedMonth(monthData)}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Sacar Pró-Labore ({formatCurrency(monthData.availableAmount)} disponível)
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Sacar Pró-Labore - {monthData.monthName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="amount">Valor a Sacar</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={monthData.availableAmount}
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="0,00"
                              />
                              <p className="text-sm text-gray-600 mt-1">
                                Máximo disponível: {formatCurrency(monthData.availableAmount)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleWithdraw}
                                disabled={isWithdrawing || !withdrawAmount}
                                className="flex-1"
                              >
                                {isWithdrawing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processando...
                                  </>
                                ) : (
                                  <>
                                    <Wallet className="h-4 w-4 mr-2" />
                                    Confirmar Saque
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setWithdrawAmount(monthData.availableAmount.toString())}
                                disabled={isWithdrawing}
                              >
                                Máximo
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Histórico de Retiradas */}
                    {monthData.records.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Retiradas Realizadas:</h4>
                        {monthData.records.map((record, index) => (
                          <div key={record.id} className="flex items-center justify-between p-2 border rounded bg-white">
                            <div>
                              <p className="font-medium">Retirada #{index + 1}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(record.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-600">
                                {formatCurrency(record.amount)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturn(record.id, monthData)}
                                disabled={isReturning === record.id}
                                className="text-red-600 hover:text-red-700"
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
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
