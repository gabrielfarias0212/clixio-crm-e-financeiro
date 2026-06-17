
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, TransactionCategory } from '../types';
import { parseDate, formatDateForSupabase } from './base';

export const parseTransaction = (transaction: any): Transaction => {
  return {
    id: transaction.id,
    amount: Number(transaction.amount),
    date: parseDate(transaction.date) || "",
    type: transaction.type as TransactionType,
    category: transaction.category as TransactionCategory,
    description: transaction.description,
    clientId: transaction.client_id,
    paymentId: transaction.payment_id,
    createdAt: parseDate(transaction.created_at) || "",
  };
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('wedding_transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data?.map(parseTransaction) || [];
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    // First, create the transaction record
    const { data, error } = await supabase
      .from('wedding_transactions')
      .insert({
        user_id: user.id,
        amount: transaction.amount,
        date: formatDateForSupabase(transaction.date),
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        client_id: transaction.clientId,
        payment_id: transaction.paymentId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }

    // If this is a client payment and no payment record exists yet, create one
    if (transaction.type === 'entrada' && transaction.clientId && !transaction.paymentId) {
      await supabase
        .from('wedding_payments')
        .insert({
          user_id: user.id,
          client_id: transaction.clientId,
          amount: transaction.amount,
          date: formatDateForSupabase(transaction.date),
          notes: transaction.description,
          payment_status: 'pago'
        });
    }

    return data ? parseTransaction(data) : null;
  } catch (error) {
    console.error('Exception creating transaction:', error);
    return null;
  }
};

export const updateTransaction = async (
  id: string, 
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<Transaction | null> => {
  try {
    // First, fetch the current transaction to check if it's a pro-labore transaction
    const { data: currentTransaction, error: fetchError } = await supabase
      .from('wedding_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching transaction for update:', fetchError);
      return null;
    }

    // Prevent editing pro-labore transactions
    if (currentTransaction.category === 'pró-labore') {
      console.error('Cannot edit pro-labore transactions');
      return null;
    }

    // Prepare update data
    const updateData: any = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.date !== undefined) updateData.date = formatDateForSupabase(updates.date);
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.paymentId !== undefined) updateData.payment_id = updates.paymentId;

    // Update the transaction
    const { data, error } = await supabase
      .from('wedding_transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      return null;
    }

    // If this transaction is linked to a payment, update the payment record too
    if (currentTransaction.payment_id && (updates.amount !== undefined || updates.date !== undefined || updates.description !== undefined)) {
      console.log('Updating linked payment record');
      await supabase
        .from('wedding_payments')
        .update({
          amount: updates.amount || currentTransaction.amount,
          date: updates.date ? formatDateForSupabase(updates.date) : currentTransaction.date,
          notes: updates.description || currentTransaction.description
        })
        .eq('id', currentTransaction.payment_id);
    }

    // Enhanced logic: If a client is being associated with an income transaction
    if (updates.clientId && 
        (updates.type === 'entrada' || currentTransaction.type === 'entrada')) {
      
      console.log('Processing client association for income transaction');
      
      // Check if there's already a matching payment for this client
      const { data: existingPayments } = await supabase
        .from('wedding_payments')
        .select('id')
        .eq('client_id', updates.clientId)
        .eq('amount', updates.amount || currentTransaction.amount)
        .eq('date', updates.date ? formatDateForSupabase(updates.date) : currentTransaction.date);

      if (existingPayments && existingPayments.length > 0 && !currentTransaction.payment_id) {
        // Link to existing payment
        console.log('Linking transaction to existing payment:', existingPayments[0].id);
        await supabase
          .from('wedding_transactions')
          .update({ payment_id: existingPayments[0].id })
          .eq('id', id);
      } else if (!currentTransaction.payment_id && (!existingPayments || existingPayments.length === 0)) {
        // Create new payment only if no existing payment and no current payment link
        console.log('Creating new payment for transaction associated with client');
        
        // Get current user for creating payment
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found for creating payment');
          return null;
        }

        const { data: newPayment, error: paymentError } = await supabase
          .from('wedding_payments')
          .insert({
            user_id: user.id,
            client_id: updates.clientId,
            amount: updates.amount || currentTransaction.amount,
            date: updates.date ? formatDateForSupabase(updates.date) : currentTransaction.date,
            notes: (updates.description || currentTransaction.description) + ' (Criado automaticamente)',
            payment_status: 'pago'
          })
          .select()
          .single();

        if (!paymentError && newPayment) {
          // Update the transaction to link it to the new payment
          await supabase
            .from('wedding_transactions')
            .update({ payment_id: newPayment.id })
            .eq('id', id);
          
          console.log('Payment created and linked to transaction');
        }
      }
    }

    return data ? parseTransaction(data) : null;
  } catch (error) {
    console.error('Exception updating transaction:', error);
    return null;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('wedding_transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
