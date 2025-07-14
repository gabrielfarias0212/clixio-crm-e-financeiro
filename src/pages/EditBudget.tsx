
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { useBudget, useUpdateBudget } from '@/hooks/useBudgets';
import Layout from '@/components/Layout';
import { CreateBudgetData } from '@/types/budget';

export default function EditBudget() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: budget, isLoading } = useBudget(id!);
  const updateBudget = useUpdateBudget();

  const handleSuccess = () => {
    navigate(`/budgets/${id}`);
  };

  const handleUpdate = async (data: CreateBudgetData) => {
    if (!id) return;
    
    try {
      await updateBudget.mutateAsync({
        budgetId: id,
        updates: {
          client_name: data.client_name,
          client_email: data.client_email,
          client_phone: data.client_phone,
          event_date: data.event_date,
          budget_title: data.budget_title,
          validity_days: data.validity_days,
          payment_method: data.payment_method,
          payment_conditions: data.payment_conditions,
          general_notes: data.general_notes,
        }
      });
      handleSuccess();
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/budgets/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!budget) {
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
          </div>
          
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Orçamento não encontrado</h3>
            <p className="text-muted-foreground">
              O orçamento solicitado não existe ou foi removido.
            </p>
          </div>
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
            onClick={() => navigate(`/budgets/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Orçamento</h1>
            <p className="text-muted-foreground">
              Atualize as informações do orçamento
            </p>
          </div>
        </div>

        <BudgetForm 
          budget={budget}
          onSubmit={handleUpdate}
          onSuccess={handleSuccess}
          isEditing={true}
        />
      </div>
    </Layout>
  );
}
