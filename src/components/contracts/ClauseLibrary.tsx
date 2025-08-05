
import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useContractClauses, useDeleteContractClause } from '@/hooks/useContracts';
import { CreateClauseDialog } from './CreateClauseDialog';

export function ClauseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createClauseOpen, setCreateClauseOpen] = useState(false);
  const [editingClause, setEditingClause] = useState(null);

  const { data: clauses = [], isLoading } = useContractClauses();
  const deleteClause = useDeleteContractClause();

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'identification', label: 'Identificação' },
    { value: 'service_object', label: 'Objeto do Serviço' },
    { value: 'payment', label: 'Pagamento' },
    { value: 'obligations', label: 'Obrigações' },
    { value: 'terms', label: 'Termos' },
    { value: 'general', label: 'Geral' },
  ];

  const filteredClauses = clauses.filter(clause => {
    const matchesSearch = clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clause.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || clause.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <div className="animate-pulse">Carregando cláusulas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Biblioteca de Cláusulas</h3>
        <Dialog open={createClauseOpen} onOpenChange={setCreateClauseOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Cláusula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Cláusula</DialogTitle>
            </DialogHeader>
            <CreateClauseDialog onClose={() => setCreateClauseOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar cláusulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {filteredClauses.map((clause) => (
          <Card key={clause.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-medium">
                    {clause.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(c => c.value === clause.category)?.label || clause.category}
                    </Badge>
                    {clause.is_required && (
                      <Badge variant="default" className="text-xs">
                        Obrigatória
                      </Badge>
                    )}
                    {clause.is_default && (
                      <Badge variant="outline" className="text-xs">
                        Padrão
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingClause(clause)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  
                  {!clause.is_default && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Cláusula</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza de que deseja excluir a cláusula "{clause.title}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteClause.mutate(clause.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="text-sm text-gray-600 line-clamp-3">
                {clause.content}
              </div>
              {clause.variables.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Variáveis:</p>
                  <div className="flex flex-wrap gap-1">
                    {clause.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {clause.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{clause.variables.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClauses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || selectedCategory !== 'all' 
            ? 'Nenhuma cláusula encontrada com os filtros aplicados.'
            : 'Nenhuma cláusula encontrada. Crie sua primeira cláusula!'
          }
        </div>
      )}

      {editingClause && (
        <Dialog open={!!editingClause} onOpenChange={() => setEditingClause(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Cláusula</DialogTitle>
            </DialogHeader>
            <CreateClauseDialog 
              clause={editingClause}
              onClose={() => setEditingClause(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
