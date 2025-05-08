
import { useContext } from 'react';
import { TransactionDataContext } from '@/contexts/TransactionDataContext';

export function useTransactionData() {
  const context = useContext(TransactionDataContext);
  if (context === undefined) {
    throw new Error('useTransactionData must be used within a TransactionDataProvider');
  }
  return context;
}
