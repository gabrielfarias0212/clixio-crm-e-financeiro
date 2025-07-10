
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Receipt, Loader2 } from "lucide-react";
import { PersonalFixedExpensesSummary } from "./PersonalFixedExpensesSummary";
import { PersonalFixedExpenseForm } from "./PersonalFixedExpenseForm";
import { PersonalFixedExpenseItem } from "./PersonalFixedExpenseItem";
import { usePersonalFixedExpenses } from "@/hooks/usePersonalFixedExpenses";
import type { PersonalFixedExpense, CreatePersonalFixedExpenseData, UpdatePersonalFixedExpenseData } from "@/utils/supabase/personal-fixed-expenses";

export const PersonalFixedExpensesList = () => {
  const {
    expenses,
    loading,
    addExpense,
    updateExpense,
    removeExpense,
    toggleExpenseStatus,
    getTotalMonthly,
    getActiveExpenses,
    getInactiveExpenses,
  } = usePersonalFixedExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PersonalFixedExpense | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const activeExpenses = getActiveExpenses();
  const inactiveExpenses = getInactiveExpenses();
  const totalMonthly = getTotalMonthly();

  const handleAddExpense = async (data: CreatePersonalFixedExpenseData): Promise<boolean> => {
    const success = await addExpense(data);
    if (success) {
      setShowForm(false);
    }
    return success;
  };

  const handleUpdateExpense = async (data: UpdatePersonalFixedExpenseData): Promise<boolean> => {
    if (!editingExpense) return false;
    
    const success = await updateExpense(editingExpense.id, data);
    if (success) {
      setEditingExpense(null);
    }
    return success;
  };

  const handleEditExpense = (expense: PersonalFixedExpense) => {
    setEditingExpense(expense);
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando contas fixas...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PersonalFixedExpensesSummary
        totalMonthly={totalMonthly}
        activeCount={activeExpenses.length}
        inactiveCount={inactiveExpenses.length}
      />

      {(showForm || editingExpense) && (
        <PersonalFixedExpenseForm
          expense={editingExpense || undefined}
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onCancel={handleCancelForm}
          isEdit={!!editingExpense}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Contas Fixas
          </CardTitle>
          {!showForm && !editingExpense && (
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Todas ({expenses.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Ativas ({activeExpenses.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inativas ({inactiveExpenses.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-3 mt-4">
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma conta fixa cadastrada ainda.</p>
                  <p className="text-sm">Clique em "Nova Conta" para começar.</p>
                </div>
              ) : (
                expenses.map((expense) => (
                  <PersonalFixedExpenseItem
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEditExpense}
                    onDelete={removeExpense}
                    onToggleStatus={toggleExpenseStatus}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="active" className="space-y-3 mt-4">
              {activeExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma conta fixa ativa.</p>
                </div>
              ) : (
                activeExpenses.map((expense) => (
                  <PersonalFixedExpenseItem
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEditExpense}
                    onDelete={removeExpense}
                    onToggleStatus={toggleExpenseStatus}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="inactive" className="space-y-3 mt-4">
              {inactiveExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma conta fixa inativa.</p>
                </div>
              ) : (
                inactiveExpenses.map((expense) => (
                  <PersonalFixedExpenseItem
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEditExpense}
                    onDelete={removeExpense}
                    onToggleStatus={toggleExpenseStatus}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
