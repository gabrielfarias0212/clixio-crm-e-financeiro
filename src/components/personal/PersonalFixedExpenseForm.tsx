
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { X, Save, Plus } from "lucide-react";
import type { PersonalFixedExpense, CreatePersonalFixedExpenseData } from "@/utils/supabase/personal-fixed-expenses";

interface PersonalFixedExpenseFormProps {
  expense?: PersonalFixedExpense;
  onSubmit: (data: CreatePersonalFixedExpenseData) => Promise<boolean>;
  onCancel: () => void;
  isEdit?: boolean;
}

export const PersonalFixedExpenseForm = ({
  expense,
  onSubmit,
  onCancel,
  isEdit = false,
}: PersonalFixedExpenseFormProps) => {
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [dueDate, setDueDate] = useState(expense?.due_date?.toString() || '');
  const [isActive, setIsActive] = useState(expense?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !amount.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    const expenseData: CreatePersonalFixedExpenseData = {
      description: description.trim(),
      amount: parseFloat(amount),
      due_date: dueDate ? parseInt(dueDate) : null,
      is_active: isActive,
    };

    const success = await onSubmit(expenseData);
    
    if (success) {
      if (!isEdit) {
        setDescription('');
        setAmount('');
        setDueDate('');
        setIsActive(true);
      }
      onCancel();
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          {isEdit ? (
            <>
              <Save className="h-4 w-4" />
              Editar Conta Fixa
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Nova Conta Fixa
            </>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Energia, Internet..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="dueDate">Dia do Vencimento</Label>
              <Input
                id="dueDate"
                type="number"
                min="1"
                max="31"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Ex: 15"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">
                Conta ativa
              </Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !description.trim() || !amount.trim()}
              className="flex-1"
            >
              {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Adicionar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
