
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Transaction, TransactionType, Client, FinancialCategory } from "@/utils/types";
import { stringToDate, dateToString } from "@/utils/dates";
import { Loader2 } from "lucide-react";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<Transaction | null>;
  clients: Client[];
  financialCategories: FinancialCategory[];
}

export function EditTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onUpdate,
  clients,
  financialCategories
}: EditTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    type: "entrada" as TransactionType,
    category: "",
    description: "",
    clientId: ""
  });

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        clientId: transaction.clientId || ""
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    setIsLoading(true);
    try {
      const updates: Partial<Omit<Transaction, 'id' | 'createdAt'>> = {
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        category: formData.category,
        description: formData.description,
        clientId: formData.clientId || undefined
      };

      const result = await onUpdate(transaction.id, updates);
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Get available categories based on transaction type
  // Fixed the type comparison - map transaction types to financial category types
  const getFinancialCategoryType = (transactionType: TransactionType) => {
    return transactionType === "entrada" ? "receita" : "despesa";
  };

  const availableCategories = financialCategories.filter(cat => 
    cat.type === getFinancialCategoryType(formData.type)
  );

  // Check if this is a pro-labore transaction
  const isProLaboreTransaction = transaction?.category === 'pró-labore';

  if (isProLaboreTransaction) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edição não permitida</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Transações de pró-labore não podem ser editadas manualmente. 
              Elas são gerenciadas automaticamente pelo sistema.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose} variant="outline">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TransactionType, category: "" }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saída">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date.includes('/') 
                  ? stringToDate(formData.date)?.toISOString().split('T')[0] || ''
                  : formData.date
                }
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "entrada" && (
              <div className="md:col-span-2">
                <Label htmlFor="client">Cliente (opcional)</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-client">Nenhum cliente</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descrição da transação"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.amount || !formData.category || !formData.description}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Atualizar Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
