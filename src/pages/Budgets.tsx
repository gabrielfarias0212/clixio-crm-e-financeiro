
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
import Layout from '@/components/Layout';

export default function Budgets() {
  const navigate = useNavigate();
  const { data: budgets = [], isLoading } = useBudgets();
  const { profile } = usePhotographerProfile();
  const deleteBudget = useDeleteBudget();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
      setDownloadingId(budget.id);
      
      // Fetch complete budget data with items
      const budgetWithItems = await fetchBudgetWithItems(budget.id);
      
      if (!budgetWithItems) {
        toast.error('Erro ao carregar dados do orçamento');
        return;
      }

      // Prepare company info from profile
      const companyInfo = profile ? {
        company_name: profile.company_name,
        logo_url: profile.logo_url,
        brand_name: profile.brand_name,
        whatsapp: profile.whatsapp,
        email: profile.email,
        website: profile.website,
      } : undefined;
      
      // Generate and download PDF
      downloadBudgetPDF(budgetWithItems, companyInfo);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading budget:', error);
      toast.error('Erro ao baixar orçamento');
    } finally {
      setDownloadingId(null);
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
          <Button onClick={() => navigate('/budgets/create')}>
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
          downloadingId={downloadingId}
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
    </Layout>
  );
}
