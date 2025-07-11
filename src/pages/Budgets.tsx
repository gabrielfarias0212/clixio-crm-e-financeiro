
import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetList } from '@/components/budget/BudgetList';
import { BudgetReceiptDialog } from '@/components/BudgetReceiptDialog';
import { useBudgets, useDeleteBudget } from '@/hooks/useBudgets';
import { usePhotographerProfile } from '@/hooks/usePhotographerProfile';
import { useNavigate } from 'react-router-dom';
import { Budget } from '@/types/budget';
import { toast } from 'sonner';
import { fetchBudgetWithItems } from '@/utils/supabase/budgets';
import Layout from '@/components/Layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Budgets() {
  const navigate = useNavigate();
  const { data: budgets = [], isLoading } = useBudgets();
  const { profile } = usePhotographerProfile();
  const deleteBudget = useDeleteBudget();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetForPrint, setBudgetForPrint] = useState<any>(null);

  const filteredBudgets = budgets.filter(budget => 
    budget.budget_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (budget: Budget) => {
    navigate(`/budgets/${budget.id}`);
  };

  const handleEdit = (budget: Budget) => {
    navigate(`/budgets/${budget.id}/edit`);
  };

  const handleDelete = (budget: Budget) => {
    setBudgetToDelete(budget);
  };

  const confirmDelete = async () => {
    if (budgetToDelete) {
      try {
        await deleteBudget.mutateAsync(budgetToDelete.id);
        setBudgetToDelete(null);
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleDownload = async (budget: Budget) => {
    console.log('=== STARTING BUDGET PRINT ===');
    console.log('Budget to print:', budget);
    
    try {
      toast.info('Carregando orçamento...');
      
      console.log('Fetching budget with items for ID:', budget.id);
      const budgetWithItems = await fetchBudgetWithItems(budget.id);
      console.log('Budget with items:', budgetWithItems);
      
      if (!budgetWithItems) {
        console.error('Budget with items not found');
        toast.error('Orçamento não encontrado');
        return;
      }

      console.log('Budget items count:', budgetWithItems.budget_items?.length || 0);
      console.log('Opening budget print dialog...');
      
      setBudgetForPrint(budgetWithItems);
      toast.success('Orçamento carregado! Clique em "Baixar PDF" para visualizar.');
    } catch (error) {
      console.error('=== BUDGET PRINT ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      toast.error(`Erro ao carregar orçamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Orçamentos</h1>
            <p className="text-muted-foreground">
              Crie e gerencie orçamentos personalizados para seus clientes
            </p>
          </div>
          <Button onClick={() => navigate('/budgets/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <BudgetList
          budgets={filteredBudgets}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />

        <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o orçamento "{budgetToDelete?.budget_title}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {budgetForPrint && (
          <BudgetReceiptDialog
            budget={budgetForPrint}
            photographerProfile={profile}
          >
            <Button 
              variant="outline"
              onClick={() => setBudgetForPrint(null)}
              className="hidden"
            >
              Baixar PDF
            </Button>
          </BudgetReceiptDialog>
        )}
      </div>
    </Layout>
  );
}
