import { supabase } from "@/integrations/supabase/client";
import { Budget, BudgetItem, CreateBudgetData, BudgetWithItems } from "@/types/budget";

export async function fetchBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }

  return data || [];
}

export async function fetchBudgetWithItems(budgetId: string): Promise<BudgetWithItems | null> {
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', budgetId)
    .single();

  if (budgetError) {
    console.error('Error fetching budget:', budgetError);
    throw budgetError;
  }

  const { data: items, error: itemsError } = await supabase
    .from('budget_items')
    .select('*')
    .eq('budget_id', budgetId)
    .order('created_at', { ascending: true });

  if (itemsError) {
    console.error('Error fetching budget items:', itemsError);
    throw itemsError;
  }

  return {
    ...budget,
    budget_items: items || []
  };
}

export async function createBudget(budgetData: CreateBudgetData): Promise<string> {
  console.log('Creating budget - checking authentication...');
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('Auth error:', authError);
    throw new Error('Authentication error');
  }
  
  if (!user?.id) {
    console.error('No user found in auth response');
    throw new Error('User not authenticated');
  }

  console.log('User authenticated:', user.id);

  // Create the budget
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      client_name: budgetData.client_name,
      client_email: budgetData.client_email,
      client_phone: budgetData.client_phone,
      event_date: budgetData.event_date,
      budget_title: budgetData.budget_title,
      validity_days: budgetData.validity_days,
      payment_method: budgetData.payment_method,
      payment_conditions: budgetData.payment_conditions,
      general_notes: budgetData.general_notes,
    })
    .select()
    .single();

  if (budgetError) {
    console.error('Error creating budget:', budgetError);
    throw budgetError;
  }

  console.log('Budget created successfully:', budget.id);

  // Create budget items
  if (budgetData.items.length > 0) {
    const itemsToInsert = budgetData.items.map(item => ({
      budget_id: budget.id,
      service_name: item.service_name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('budget_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error creating budget items:', itemsError);
      throw itemsError;
    }

    console.log('Budget items created successfully');
  }

  return budget.id;
}

export async function updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', budgetId);

  if (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
}

export async function deleteBudget(budgetId: string): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId);

  if (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}

export async function addBudgetItem(budgetId: string, item: Omit<BudgetItem, 'id' | 'budget_id' | 'subtotal' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('budget_items')
    .insert({
      budget_id: budgetId,
      service_name: item.service_name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    });

  if (error) {
    console.error('Error adding budget item:', error);
    throw error;
  }
}

export async function updateBudgetItem(itemId: string, updates: Partial<BudgetItem>): Promise<void> {
  const { error } = await supabase
    .from('budget_items')
    .update(updates)
    .eq('id', itemId);

  if (error) {
    console.error('Error updating budget item:', error);
    throw error;
  }
}

export async function deleteBudgetItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting budget item:', error);
    throw error;
  }
}
