
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { useBudget } from '@/hooks/useBudgets';
import Layout from '@/components/Layout';

export default function EditBudget() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: budget, isLoading } = useBudget(id!);

  const handleSuccess = (budgetId: string) => {
    navigate(`/budgets/${budgetId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/budgets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!budget) {
    return (
      <Layout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/budgets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium mb-2">Orçamento não encontrado</h3>
              <p className="text-muted-foreground text-center">
                O orçamento solicitado não existe ou foi removido.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/budgets')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Orçamento</h1>
            <p className="text-muted-foreground">
              Modifique os dados do orçamento "{budget.budget_title}"
            </p>
          </div>
        </div>

        <BudgetForm 
          initialData={budget} 
          onSuccess={handleSuccess} 
          isEditing={true}
        />
      </div>
    </Layout>
  );
}
