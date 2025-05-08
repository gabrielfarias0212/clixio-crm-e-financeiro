
import { Payment } from '../../types';
import { parseDate } from '../base';

/**
 * Parse raw payment data from Supabase into a Payment object
 */
export const parsePayment = (payment: any): Payment => {
  return {
    id: payment.id,
    amount: Number(payment.amount),
    date: parseDate(payment.date) || "",
    notes: payment.notes,
    due_date: payment.due_date ? parseDate(payment.due_date) : undefined,
    payment_status: payment.payment_status || "pendente"
  };
};
