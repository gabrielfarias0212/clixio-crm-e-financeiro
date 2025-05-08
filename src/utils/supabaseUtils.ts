
// This file re-exports all Supabase utility functions from the modular files
// to maintain backwards compatibility with existing code

export { 
  parseDate, 
  formatDateForSupabase, 
  clearAllData 
} from './supabase/base';

export { 
  parseClient, 
  fetchClients, 
  fetchClient, 
  createClient, 
  updateClient, 
  deleteClient,
  ClientSortOption,
  SortDirection
} from './supabase/clients';

export { 
  parsePayment, 
  fetchPaymentsForClient, 
  createPayment, 
  deletePayment,
  updatePayment,
  updatePaymentStatus,
  updatePaymentDueDate,
  checkAndUpdateOverduePayments
} from './supabase/payments';

export { 
  parseTransaction, 
  fetchTransactions, 
  createTransaction, 
  deleteTransaction 
} from './supabase/transactions';

export { 
  fetchFinancialCategories, 
  createFinancialCategory 
} from './supabase/categories';
