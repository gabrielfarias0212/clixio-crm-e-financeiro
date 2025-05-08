
import { Payment, PaymentStatus } from '../../types';

export interface CreatePaymentParams {
  clientId: string;
  amount: number;
  date: string;
  notes?: string;
  due_date?: string;
  payment_status?: string;
}

export interface UpdatePaymentParams extends Partial<Payment> {
  id: string;
}
