
import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetList } from '@/components/budget/BudgetList';
import { useBudgets, useDeleteBudget } from '@/hooks/useBudgets';
import { usePhotographerProfile } from '@/hooks/usePhotographerProfile';
import { useNavigate } from 'react-router-dom';
import { Budget } from '@/types/budget';
import { toast } from 'sonner';
import { fetchBudgetWithItems } from '@/utils/supabase/budgets';
import { downloadBudgetPDF } from '@/utils/pdfGenerator';
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
    try {
      toast.info('Preparando download do PDF...');
      
      // Buscar os dados completos do orçamento com itens
      const budgetWithItems = await fetchBudgetWithItems(budget.id);
      
      if (!budgetWithItems) {
        toast.error('Orçamento não encontrado');
        return;
      }

      // Preparar informações da empresa se disponível
      const companyInfo = profile ? {
        company_name: profile.company_name,
        name: profile.brand_name,
        email: profile.email,
        phone: profile.whatsapp,
        website: profile.website,
        avatar_url: profile.logo_url,
      } : undefined;

      // Gerar e baixar o PDF
      downloadBudgetPDF(budgetWithItems, companyInfo);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading budget:', error);
      toast.error('Erro ao baixar orçamento');
    }
  };

  return (
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
    </div>
  );
}
