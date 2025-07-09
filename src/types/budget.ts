export interface Budget {
  id: string;
  user_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  event_date?: string;
  budget_title: string;
  created_at: string;
  updated_at: string;
  validity_days: number;
  payment_method?: string;
  payment_conditions?: string;
  general_notes?: string;
  total_amount: number;
  status: string;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  service_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface CreateBudgetData {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  event_date?: string;
  budget_title: string;
  validity_days: number;
  payment_method?: string;
  payment_conditions?: string;
  general_notes?: string;
  items: Array<{
    service_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface BudgetWithItems extends Budget {
  budget_items: BudgetItem[];
}