
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Save, Eye, ArrowLeft, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useContractTemplate, useUpdateContractTemplate, useContractClauses } from '@/hooks/useContracts';
import { ContractClause } from '@/types/contract';
import { toast } from 'sonner';

export default function ContractEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: template, isLoading } = useContractTemplate(id!);
  const { data: allClauses = [] } = useContractClauses();
  const updateTemplate = useUpdateContractTemplate();

  const [templateClauses, setTemplateClauses] = useState<ContractClause[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [addClauseOpen, setAddClauseOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      
      // Load clauses based on clauses_order
      if (template.clauses_order && template.clauses_order.length > 0) {
        const orderedClauses = template.clauses_order
          .map(clauseId => allClauses.find(c => c.id === clauseId))
          .filter(Boolean) as ContractClause[];
        setTemplateClauses(orderedClauses);
      }
    }
  }, [template, allClauses]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(templateClauses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTemplateClauses(items);
    setHasChanges(true);
  };

  const addClause = (clause: ContractClause) => {
    if (!templateClauses.find(c => c.id === clause.id)) {
      setTemplateClauses([...templateClauses, clause]);
      setHasChanges(true);
    }
    setAddClauseOpen(false);
    toast.success('Cláusula adicionada ao template');
  };

  const removeClause = (clauseId: string) => {
    setTemplateClauses(templateClauses.filter(c => c.id !== clauseId));
    setHasChanges(true);
  };

  const saveTemplate = async () => {
    if (!template) return;

    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: {
          name: templateName,
          description: templateDescription,
          clauses_order: templateClauses.map(c => c.id),
        }
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const generatePreview = () => {
    let content = '';
    templateClauses.forEach((clause, index) => {
      content += `${index + 1}. ${clause.title.toUpperCase()}\n\n`;
      content += `${clause.content}\n\n`;
    });
    return content;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Template não encontrado</h1>
          <Button onClick={() => navigate('/contracts')} className="mt-4">
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/contracts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editor de Template</h1>
            <p className="text-gray-600 mt-1">
              Personalize seu template de contrato
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Preview do Contrato</DialogTitle>
              </DialogHeader>
              <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg">
                {generatePreview()}
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={saveTemplate} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {hasChanges ? 'Salvar Alterações' : 'Salvo'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Template</Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => {
                    setTemplateName(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Nome do template..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={templateDescription}
                  onChange={(e) => {
                    setTemplateDescription(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Descrição do template..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cláusulas do Contrato</CardTitle>
              <Dialog open={addClauseOpen} onOpenChange={setAddClauseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Cláusula
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Adicionar Cláusula</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {allClauses.map((clause) => (
                      <Card 
                        key={clause.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addClause(clause)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{clause.title}</h4>
                            {templateClauses.find(c => c.id === clause.id) && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Já adicionada
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {clause.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="clauses">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {templateClauses.map((clause, index) => (
                        <Draggable key={clause.id} draggableId={clause.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}`}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab hover:text-gray-600"
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-medium">{clause.title}</h4>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeClause(clause.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                  {clause.content}
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              {templateClauses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma cláusula adicionada ainda.</p>
                  <p className="text-sm">Clique em "Adicionar Cláusula" para começar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Cláusula
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Save className="w-4 h-4 mr-2" />
                Salvar como Novo Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                Gerar Contrato
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cláusulas:</span>
                <span>{templateClauses.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Categoria:</span>
                <span>{template.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Criado em:</span>
                <span>{new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
