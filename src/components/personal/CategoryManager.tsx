
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Tag } from "lucide-react";
import { usePersonalCategories } from "@/hooks/usePersonalCategories";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { useState } from "react";

export function CategoryManager() {
  const { 
    customCategories, 
    loading, 
    removeCategory, 
    getCustomCategoriesForType 
  } = usePersonalCategories();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const incomeCategories = getCustomCategoriesForType('entrada');
  const expenseCategories = getCustomCategoriesForType('saida');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gerenciar Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando categorias...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Gerenciar Categorias
            </CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Categorias de Entrada */}
          <div>
            <h3 className="font-medium text-green-600 mb-3">Categorias de Entrada Personalizadas</h3>
            {incomeCategories.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma categoria personalizada de entrada criada</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {incomeCategories.map(category => (
                  <div key={category.id} className="flex items-center gap-1">
                    <Badge className="bg-green-100 text-green-700">
                      {category.name}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCategory(category.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categorias de Saída */}
          <div>
            <h3 className="font-medium text-red-600 mb-3">Categorias de Saída Personalizadas</h3>
            {expenseCategories.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma categoria personalizada de saída criada</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map(category => (
                  <div key={category.id} className="flex items-center gap-1">
                    <Badge className="bg-red-100 text-red-700">
                      {category.name}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCategory(category.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>💡 <strong>Dica:</strong> As categorias padrão do sistema não podem ser removidas, mas você pode criar suas próprias categorias personalizadas.</p>
          </div>
        </CardContent>
      </Card>

      <CreateCategoryDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </>
  );
}
