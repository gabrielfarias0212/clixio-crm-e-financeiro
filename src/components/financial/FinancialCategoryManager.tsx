
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialCategory, TransactionType } from "@/utils/types";
import { Trash2 } from "lucide-react";

interface FinancialCategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FinancialCategory[];
  addCategory: (name: string, type: TransactionType) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  loading: boolean;
}

export function FinancialCategoryManager({
  isOpen,
  onClose,
  categories,
  addCategory,
  removeCategory,
  loading,
}: FinancialCategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [activeTab, setActiveTab] = useState<TransactionType>("entrada");

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName, activeTab);
      setNewCategoryName("");
    }
  };

  const getFilteredCategories = (type: TransactionType) => {
    return categories.filter((c) => c.type === type);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="entrada"
          onValueChange={(value) => setActiveTab(value as TransactionType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrada">Entradas</TabsTrigger>
            <TabsTrigger value="saída">Saídas</TabsTrigger>
          </TabsList>
          <TabsContent value="entrada" className="mt-4">
            <CategoryList
              categories={getFilteredCategories("entrada")}
              removeCategory={removeCategory}
            />
          </TabsContent>
          <TabsContent value="saída" className="mt-4">
            <CategoryList
              categories={getFilteredCategories("saída")}
              removeCategory={removeCategory}
            />
          </TabsContent>
        </Tabs>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder={`Nova categoria de ${activeTab === 'entrada' ? 'entrada' : 'saída'}`}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button onClick={handleAddCategory} disabled={loading || !newCategoryName.trim()}>
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CategoryListProps {
  categories: FinancialCategory[];
  removeCategory: (id: string) => Promise<void>;
}

function CategoryList({ categories, removeCategory }: CategoryListProps) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria personalizada.</p>;
  }
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between p-2 bg-muted rounded-md"
        >
          <span className="text-sm">{category.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => removeCategory(category.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
