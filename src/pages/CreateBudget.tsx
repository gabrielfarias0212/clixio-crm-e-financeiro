
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

export default function CreateBudget() {
  const navigate = useNavigate();

  const handleSuccess = (budgetId: string) => {
    navigate(`/budgets/${budgetId}`);
  };

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
            <h1 className="text-3xl font-bold">Novo Orçamento</h1>
            <p className="text-muted-foreground">
              Crie um orçamento personalizado para seu cliente
            </p>
          </div>
        </div>

        <BudgetForm onSuccess={handleSuccess} />
      </div>
    </Layout>
  );
}
