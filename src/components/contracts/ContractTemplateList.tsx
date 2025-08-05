
import { useState } from 'react';
import { FileText, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ContractTemplate } from '@/types/contract';
import { useDeleteContractTemplate } from '@/hooks/useContracts';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContractTemplateListProps {
  templates: ContractTemplate[];
  loading: boolean;
}

export function ContractTemplateList({ templates, loading }: ContractTemplateListProps) {
  const navigate = useNavigate();
  const deleteTemplate = useDeleteContractTemplate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum template</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece criando seu primeiro template de contrato.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/contracts/new')}>
            <FileText className="w-4 h-4 mr-2" />
            Criar Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {template.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {template.description || 'Sem descrição'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Badge variant={template.is_default ? 'default' : 'secondary'}>
                  {template.is_default ? 'Padrão' : 'Personalizado'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-gray-500">
                <div>Categoria: <span className="font-medium">{template.category}</span></div>
                <div>Criado em: {format(new Date(template.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/contracts/template/${template.id}`)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/contracts/preview/${template.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Lógica para duplicar template
                    console.log('Duplicar template:', template.id);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza de que deseja excluir o template "{template.name}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteTemplate.mutate(template.id)}
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
      ))}
    </div>
  );
}
