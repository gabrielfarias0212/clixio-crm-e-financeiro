
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { usePhotographerProfile } from '@/hooks/usePhotographerProfile';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  sent: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export default function BudgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: budget, isLoading } = useBudget(id!);
  const { profile } = usePhotographerProfile();
  const deleteBudget = useDeleteBudget();

  const handleDownload = async () => {
    if (!budget) {
      console.error('No budget data available for download');
      toast.error('Orçamento não encontrado');
      return;
    }

    console.log('=== BUDGET DETAIL PDF DOWNLOAD ===');
    console.log('Budget data:', budget);
    console.log('Profile data:', profile);

    try {
      toast.info('Preparando download do PDF...');
      
      // Preparar informações da empresa se disponível
      const companyInfo = profile ? {
        company_name: profile.company_name || '',
        name: profile.brand_name || '',
        email: profile.email || '',
        phone: profile.whatsapp || '',
        website: profile.website || '',
        avatar_url: profile.logo_url || '',
      } : undefined;

      console.log('Company info for PDF:', companyInfo);
      console.log('Budget items count:', budget.budget_items?.length || 0);
      
      // Gerar e baixar o PDF
      console.log('Starting PDF generation...');
      await downloadBudgetPDF(budget, companyInfo);
      
      console.log('PDF download completed successfully');
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('=== BUDGET DETAIL PDF ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast.error(`Erro ao baixar orçamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async () => {
    if (budget) {
      try {
        await deleteBudget.mutateAsync(budget.id);
        navigate('/budgets');
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  if (!budget) {
    return (
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
    );
  }

  const createdDate = format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR });
  const validityDate = new Date(budget.created_at);
  validityDate.setDate(validityDate.getDate() + budget.validity_days);
  const validityFormatted = format(validityDate, 'dd/MM/yyyy', { locale: ptBR });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/budgets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{budget.budget_title}</h1>
            <p className="text-muted-foreground">Detalhes do orçamento</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button variant="outline" onClick={() => navigate(`/budgets/${budget.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Budget Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Informações do Cliente</CardTitle>
                <Badge className={statusColors[budget.status as keyof typeof statusColors]}>
                  {statusLabels[budget.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Nome</h4>
                <p className="text-muted-foreground">{budget.client_name}</p>
              </div>
              
              {budget.client_email && (
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-muted-foreground">{budget.client_email}</p>
                </div>
              )}
              
              {budget.client_phone && (
                <div>
                  <h4 className="font-medium">Telefone</h4>
                  <p className="text-muted-foreground">{budget.client_phone}</p>
                </div>
              )}
              
              {budget.event_date && (
                <div>
                  <h4 className="font-medium">Data do Evento</h4>
                  <p className="text-muted-foreground">
                    {format(new Date(budget.event_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Itens e Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budget.budget_items && budget.budget_items.length > 0 ? (
                  budget.budget_items.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.service_name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Quantidade: {item.quantity}</span>
                          <span>Preço unitário: {formatCurrency(item.unit_price)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Nenhum item adicionado a este orçamento.</p>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Geral:</span>
                  <span>{formatCurrency(budget.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Criado em</h4>
                <p className="text-muted-foreground">{createdDate}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Válido até</h4>
                <p className="text-muted-foreground">{validityFormatted}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Validade</h4>
                <p className="text-muted-foreground">{budget.validity_days} dias</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Conditions */}
          {(budget.payment_method || budget.payment_conditions) && (
            <Card>
              <CardHeader>
                <CardTitle>Condições de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budget.payment_method && (
                  <div>
                    <h4 className="font-medium">Forma de Pagamento</h4>
                    <p className="text-muted-foreground">{budget.payment_method}</p>
                  </div>
                )}
                
                {budget.payment_conditions && (
                  <div>
                    <h4 className="font-medium">Condições</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{budget.payment_conditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* General Notes */}
          {budget.general_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{budget.general_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
