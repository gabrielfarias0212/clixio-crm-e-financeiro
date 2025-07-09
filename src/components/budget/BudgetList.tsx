import React from 'react';
import { Budget } from '@/types/budget';
import { BudgetCard } from './BudgetCard';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface BudgetListProps {
  budgets: Budget[];
  isLoading?: boolean;
  onView?: (budget: Budget) => void;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budget: Budget) => void;
  onDownload?: (budget: Budget) => void;
}

export function BudgetList({ 
  budgets, 
  isLoading, 
  onView, 
  onEdit, 
  onDelete, 
  onDownload 
}: BudgetListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum orçamento encontrado</h3>
          <p className="text-muted-foreground text-center">
            Comece criando seu primeiro orçamento personalizado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}