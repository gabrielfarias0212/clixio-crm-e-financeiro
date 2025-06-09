
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, FileText } from "lucide-react";
import { Transaction } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";

interface TransactionCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category: string;
  transactions: Transaction[];
  type: 'entrada' | 'saída';
  totalAmount: number;
}

export function TransactionCategoryModal({
  open,
  onClose,
  category,
  transactions,
  type,
  totalAmount
}: TransactionCategoryModalProps) {
  const { clients } = useClients();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    const client = clients.find(c => c.id === clientId);
    return client?.name;
  };

  const getTypeColor = (transactionType: string) => {
    return transactionType === 'entrada' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {category} - {type === 'entrada' ? 'Receitas' : 'Despesas'}
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              {transactions.length} transação(ões) • Total: {formatCurrency(totalAmount)}
            </p>
            <Badge className={getTypeColor(type)} variant="secondary">
              {type === 'entrada' ? 'Receitas' : 'Despesas'}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-6 space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma transação encontrada para esta categoria</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {transaction.description || 'Sem descrição'}
                      </h3>
                      {transaction.clientId && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Cliente: {getClientName(transaction.clientId) || 'Cliente não encontrado'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Number(transaction.amount))}
                      </div>
                      <Badge className={getTypeColor(transaction.type)} variant="secondary">
                        {transaction.category || 'Sem categoria'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data: {formatDate(transaction.date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
