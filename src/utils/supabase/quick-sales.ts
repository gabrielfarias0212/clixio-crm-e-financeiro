
import { supabase } from "@/integrations/supabase/client";
import { QuickTransaction, QuickSaleFormData } from "@/utils/types";
import { createTransaction } from "./transactions";

export async function fetchQuickTransactions(): Promise<QuickTransaction[]> {
  console.log('Fetching quick transactions...');
  
  const { data, error } = await supabase
    .from('quick_transactions')
    .select(`
      *,
      wedding_clients (
        name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quick transactions:', error);
    throw error;
  }

  return data || [];
}

export async function createQuickSale(saleData: QuickSaleFormData): Promise<QuickTransaction> {
  console.log('Creating quick sale:', saleData);

  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Get catalog item details if selected
  let itemName = saleData.customName || '';
  if (saleData.catalogItemId) {
    if (saleData.type === 'service') {
      const { data: serviceItem } = await supabase
        .from('service_catalog')
        .select('name')
        .eq('id', saleData.catalogItemId)
        .single();
      itemName = serviceItem?.name || itemName;
    } else {
      const { data: productItem } = await supabase
        .from('product_catalog')
        .select('name')
        .eq('id', saleData.catalogItemId)
        .single();
      itemName = productItem?.name || itemName;
    }
  }

  // Create quick transaction
  const { data: quickTransaction, error } = await supabase
    .from('quick_transactions')
    .insert({
      user_id: userId,
      client_id: saleData.clientId || null,
      transaction_type: saleData.type,
      item_name: itemName,
      catalog_id: saleData.catalogItemId || null,
      amount: saleData.amount,
      sale_date: saleData.saleDate,
      payment_method: saleData.paymentMethod,
      payment_status: saleData.installments === 1 ? 'pago' : 'pendente',
      installments: saleData.installments,
      notes: saleData.notes || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating quick transaction:', error);
    throw error;
  }

  // Create financial transaction for cash flow integration
  try {
    await createTransaction({
      type: 'receita',
      category: saleData.type === 'service' ? 'Serviços Extras' : 'Produtos',
      description: `${itemName}${saleData.clientId ? ' - Cliente vinculado' : ''}`,
      amount: saleData.amount,
      date: saleData.saleDate,
      client_id: saleData.clientId || null,
      payment_id: null
    });
    console.log('Financial transaction created successfully');
  } catch (financialError) {
    console.error('Error creating financial transaction:', financialError);
    // Don't throw here - the quick sale was created successfully
  }

  return quickTransaction;
}

export async function updateQuickTransactionPaymentStatus(
  id: string,
  paymentStatus: string
): Promise<QuickTransaction> {
  console.log('Updating quick transaction payment status:', id, paymentStatus);

  const { data, error } = await supabase
    .from('quick_transactions')
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quick transaction:', error);
    throw error;
  }

  return data;
}
