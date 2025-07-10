
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Calendar, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { PersonalFixedExpense } from "@/utils/supabase/personal-fixed-expenses";

interface PersonalFixedExpenseItemProps {
  expense: PersonalFixedExpense;
  onEdit: (expense: PersonalFixedExpense) => void;
  onDelete: (id: string) => Promise<boolean>;
  onToggleStatus: (id: string, isActive: boolean) => Promise<boolean>;
}

export const PersonalFixedExpenseItem = ({
  expense,
  onEdit,
  onDelete,
  onToggleStatus,
}: PersonalFixedExpenseItemProps) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleStatus = async (checked: boolean) => {
    setIsToggling(true);
    await onToggleStatus(expense.id, checked);
    setIsToggling(false);
  };

  const handleDelete = async () => {
    await onDelete(expense.id);
  };

  return (
    <Card className={`transition-all ${expense.is_active ? '' : 'opacity-60 bg-gray-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">{expense.description}</h4>
              <Badge 
                variant={expense.is_active ? "default" : "secondary"}
                className={expense.is_active ? "bg-green-100 text-green-800" : ""}
              >
                {expense.is_active ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativa
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Inativa
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-lg text-gray-900">
                {formatCurrency(expense.amount)}
              </span>
              {expense.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Vence dia {expense.due_date}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={expense.is_active}
              onCheckedChange={handleToggleStatus}
              disabled={isToggling}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(expense)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a conta fixa "{expense.description}"?
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
