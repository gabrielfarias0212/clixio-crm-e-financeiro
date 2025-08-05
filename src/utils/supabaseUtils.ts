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
  deleteClient 
} from './supabase/clients';

export { 
  parsePayment, 
  fetchPaymentsForClient, 
  createPayment, 
  deletePayment,
  updatePaymentStatus,
  updatePaymentDueDate,
  updatePaymentNotes,
  checkAndUpdateOverduePayments,
  markContractAsPaid
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

export {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from './supabase/calendar-events';

export {
  fetchPersonalTransactions,
  createPersonalTransaction,
  deletePersonalTransaction,
  migrateLocalStorageToDatabase
} from './supabase/personal-transactions';

export {
  fetchPersonalCategories,
  createPersonalCategory,
  deletePersonalCategory,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES
} from './supabase/personal-categories';

export {
  fetchBudgets,
  fetchBudgetWithItems,
  createBudget,
  updateBudget,
  deleteBudget,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem
} from './supabase/budgets';

// Export types separately to fix isolatedModules issue
export type { PersonalCategory } from './supabase/personal-categories';

export {
  fetchContractClauses,
  createContractClause,
  updateContractClause,
  deleteContractClause,
  fetchContractTemplates,
  fetchContractTemplate,
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
  fetchContractFields,
  createContractField,
  updateContractField,
  deleteContractField,
  fetchGeneratedContracts,
  createGeneratedContract,
  updateGeneratedContract,
  createContractVersion,
  fetchContractVersions
} from './supabase/contracts';
