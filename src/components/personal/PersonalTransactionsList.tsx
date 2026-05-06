
import { formatDate } from '@/utils/dates';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RotateCcw, Loader2 } from "lucide-react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { toast } from "sonner";
import { PersonalTransaction } from "@/hooks/usePersonalTransactions";
import { deletePersonalTransaction } from "@/utils/supabase/personal-transactions";
import { deleteTransaction, fetchTransactions } from "@/utils/supabase/transactions";
import { useState } from "react";

interface PersonalTransactionsListProps {
  transactions: PersonalTransaction[];
  currentWeek?: any;
  weeklyBalance?: number;
  onTransactionRemoved?: () => void;
}

export function PersonalTransactionsList({ 
  transactions, 
  onTransactionRemoved 
}: PersonalTransactionsListProps) {
  const [returningTransactionId, setReturningTransactionId] = useState<string | null>(null);
  
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
    
    setReturningTransactionId(transaction.id);
    
    try {
      console.log('🔄 === INICIANDO DEVOLUÇÃO DE PRÓ-LABORE (PESSOAL) ===');
      console.log('📋 Transação:', transaction);
      
      // Mostrar toast de progresso
      toast.info('Processando devolução...', {
        duration: 2000
      });

      let businessTransactionRemoved = false;
      let personalTransactionRemoved = false;

      // 1. Buscar e remover transação empresarial relacionada
      console.log('🏢 === BUSCANDO TRANSAÇÃO EMPRESARIAL RELACIONADA ===');
      
      try {
        const allBusinessTransactions = await fetchTransactions();
        console.log(`📊 Total de transações empresariais: ${allBusinessTransactions.length}`);
        
        // Buscar transação empresarial por critérios (valor, data e categoria)
        const relatedBusinessTransaction = allBusinessTransactions.find(t => {
          const isMatch = (
            t.type === 'saída' &&
            t.category === 'pró-labore' &&
            Math.abs(t.amount - transaction.amount) < 0.01 &&
            (t.description.includes(transaction.pro_labore_week_key!) || 
             t.description.includes('pró-labore'))
          );
          
          if (isMatch) {
            console.log('✅ Transação empresarial relacionada encontrada:', t);
          }
          
          return isMatch;
        });
        
        if (relatedBusinessTransaction) {
          console.log(`🗑️ Removendo transação empresarial: ${relatedBusinessTransaction.id}`);
          await deleteTransaction(relatedBusinessTransaction.id);
          businessTransactionRemoved = true;
          console.log('✅ Transação empresarial removida com sucesso');
        } else {
          console.warn('⚠️ Transação empresarial relacionada não encontrada');
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar/remover transação empresarial:', error);
      }

      // 2. Remover transação pessoal
      console.log('👤 === REMOVENDO TRANSAÇÃO PESSOAL ===');
      
      try {
        console.log(`🗑️ Removendo transação pessoal: ${transaction.id}`);
        await deletePersonalTransaction(transaction.id);
        personalTransactionRemoved = true;
        console.log('✅ Transação pessoal removida com sucesso');
      } catch (error) {
        console.error('❌ Erro ao remover transação pessoal:', error);
      }

      // 3. Verificar resultado
      if (personalTransactionRemoved || businessTransactionRemoved) {
        toast.success(`Pró-labore de ${formatCurrency(transaction.amount)} devolvido com sucesso!`, {
          description: 'As transações foram removidas do sistema'
        });
        
        // Refresh das transações
        console.log('🔄 Atualizando transações...');
        if (onTransactionRemoved) {
          onTransactionRemoved();
        }
        await refreshTransactions();
        console.log('✅ Transações atualizadas');
      } else {
        toast.error('Não foi possível devolver o pró-labore', {
          description: 'Nenhuma transação foi removida'
        });
      }
      
    } catch (error) {
      console.error('❌ Erro durante a devolução:', error);
      toast.error('Erro inesperado durante a devolução');
    } finally {
      setReturningTransactionId(null);
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
                    {formatDate(transaction.date)}
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
                    disabled={returningTransactionId === transaction.id}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    {returningTransactionId === transaction.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Devolvendo...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Devolver
                      </>
                    )}
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
