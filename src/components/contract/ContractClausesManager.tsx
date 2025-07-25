
import { useState } from "react";
import { useContractClauses, useCreateContractClause, useUpdateContractClause, useDeleteContractClause } from "@/hooks/useContractClauses";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, X, GripVertical } from "lucide-react";
import { ContractClause } from "@/types/contract";
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
} from "@/components/ui/alert-dialog";

interface ContractClausesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractClausesManager({ open, onOpenChange }: ContractClausesManagerProps) {
  const [editingClause, setEditingClause] = useState<ContractClause | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "", 
    content: "", 
    clauseOrder: 1, 
    isRequired: false 
  });
  
  const { data: clauses } = useContractClauses();
  const createClause = useCreateContractClause();
  const updateClause = useUpdateContractClause();
  const deleteClause = useDeleteContractClause();

  const handleCreate = () => {
    setIsCreating(true);
    const nextOrder = Math.max(...(clauses?.map(c => c.clause_order) || [0])) + 1;
    setFormData({ title: "", content: "", clauseOrder: nextOrder, isRequired: false });
    setEditingClause(null);
  };

  const handleEdit = (clause: ContractClause) => {
    setEditingClause(clause);
    setFormData({ 
      title: clause.title, 
      content: clause.content, 
      clauseOrder: clause.clause_order, 
      isRequired: clause.is_required 
    });
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (editingClause) {
      await updateClause.mutateAsync({
        id: editingClause.id,
        title: formData.title,
        content: formData.content,
        clauseOrder: formData.clauseOrder,
        isRequired: formData.isRequired
      });
    } else {
      await createClause.mutateAsync({
        title: formData.title,
        content: formData.content,
        clauseOrder: formData.clauseOrder,
        isRequired: formData.isRequired
      });
    }
    
    setEditingClause(null);
    setIsCreating(false);
    setFormData({ title: "", content: "", clauseOrder: 1, isRequired: false });
  };

  const handleCancel = () => {
    setEditingClause(null);
    setIsCreating(false);
    setFormData({ title: "", content: "", clauseOrder: 1, isRequired: false });
  };

  const handleDelete = async (id: string) => {
    await deleteClause.mutateAsync(id);
  };

  const isEditing = editingClause || isCreating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Cláusulas do Contrato</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEditing && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Gerencie as cláusulas que aparecem em seus contratos. Use variáveis como {`{{precoTotal}}`} para dados dinâmicos.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Cláusula
              </Button>
            </div>
          )}

          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingClause ? "Editar Cláusula" : "Nova Cláusula"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título da Cláusula</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: OBJETO DO CONTRATO"
                    />
                  </div>
                  <div>
                    <Label htmlFor="order">Ordem</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.clauseOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, clauseOrder: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="required"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
                  />
                  <Label htmlFor="required">Cláusula obrigatória</Label>
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo da Cláusula</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Digite o conteúdo da cláusula..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.title || !formData.content}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {clauses?.sort((a, b) => a.clause_order - b.clause_order).map((clause) => (
                <Card key={clause.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div>
                          <CardTitle className="text-lg">{clause.title}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">
                              Ordem: {clause.clause_order}
                            </Badge>
                            {clause.is_required && (
                              <Badge variant="destructive">
                                Obrigatória
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(clause)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!clause.is_required && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta cláusula? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(clause.id)}>
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
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-4">
                        {clause.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
