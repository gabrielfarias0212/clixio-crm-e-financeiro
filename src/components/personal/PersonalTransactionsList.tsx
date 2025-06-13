
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { useProLabore } from "@/hooks/useProLabore";
import { useTransactions } from "@/contexts/TransactionsContext";
import { WeekInfo } from "@/utils/dates/weekUtils";
import { toast } from "sonner";
import { PersonalTransaction } from "@/hooks/usePersonalTransactions";

interface PersonalTransactionsListProps {
  transactions: PersonalTransaction[];
  currentWeek?: WeekInfo;
  weeklyBalance?: number;
  onTransactionRemoved?: () => void;
}

export function PersonalTransactionsList({ 
  transactions, 
  currentWeek, 
  weeklyBalance = 0,
  onTransactionRemoved 
}: PersonalTransactionsListProps) {
  // Usar valores padrão quando currentWeek não estiver disponível
  const defaultWeek: WeekInfo = {
    start: new Date(),
    end: new Date(),
    label: "Semana atual"
  };
  
  const { returnProLabore } = useProLabore(currentWeek || defaultWeek, weeklyBalance);
  
  // Hook para refresh das transações empresariais
  const { refreshTransactions } = useTransactions();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleReturnProLabore = async (transaction: PersonalTransaction) => {
    if (!transaction.pro_labore_week_key) {
      toast.error('Transação não possui chave de pró-labore válida');
      return;
    }
    
    console.log('Devolvendo pró-labore:', {
      transactionId: transaction.id,
      weekKey: transaction.pro_labore_week_key,
      amount: transaction.amount
    });
    
    try {
      const success = await returnProLabore(transaction.pro_labore_week_key);
      
      if (success) {
        toast.success('Pró-labore devolvido para a empresa com sucesso!');
        
        // Refresh both personal and business transactions
        if (onTransactionRemoved) {
          onTransactionRemoved();
        }
        
        // Also refresh business transactions to remove the debit entry
        await refreshTransactions();
        
        console.log('Pró-labore devolvido com sucesso');
      } else {
        toast.error('Não foi possível devolver o pró-labore');
        console.error('Falha ao devolver pró-labore');
      }
    } catch (error) {
      console.error('Erro ao devolver pró-labore:', error);
      toast.error('Erro interno ao devolver pró-labore');
    }
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    if (category === 'pró-labore') {
      return (
        <Badge className="bg-blue-100 text-blue-700 text-xs">
          Pró-labore
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="text-xs">
        {category}
      </Badge>
    );
  };

  if (transactions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {transaction.type === 'entrada' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{transaction.description}</p>
                    {getCategoryBadge(transaction.category)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`font-bold ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                {transaction.category === 'pró-labore' && transaction.pro_labore_week_key && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReturnProLabore(transaction)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Devolver
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
