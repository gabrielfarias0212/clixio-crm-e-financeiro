
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

export {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from './supabase/calendar-events';

export {
  fetchProLaboreConfig,
  createOrUpdateProLaboreConfig,
  fetchProLaboreRegistros,
  createProLaboreRegistro,
  deleteProLaboreRegistro,
  getCurrentPeriodReference,
  type ProLaboreConfig,
  type ProLaboreRegistro,
  type CalculationType
} from './supabase/prolabore';
