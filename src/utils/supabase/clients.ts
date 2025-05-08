
// Re-export all client-related functions for backward compatibility
export { parseClient } from './client-parsers';
export { 
  fetchClients, 
  fetchClient,
  ClientSortOption,
  SortDirection 
} from './client-fetch';
export { createClient } from './client-create';
export { updateClient } from './client-update';
export { deleteClient } from './client-delete';
