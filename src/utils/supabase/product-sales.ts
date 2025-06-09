
import { supabase } from "@/integrations/supabase/client";
import { ProductSale, ProductPayment, ProductType, ProductOrderStatus, ProductPaymentStatus, PaymentStatus } from "@/utils/types";

export async function fetchProductSales(): Promise<ProductSale[]> {
  console.log("Fetching product sales...");
  
  const { data, error } = await supabase
    .from('product_sales')
    .select(`
      *,
      client:wedding_clients(id, name, email, phone),
      payments:product_payments(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching product sales:", error);
    throw error;
  }

  return (data || []).map(sale => ({
    ...sale,
    product_type: sale.product_type as ProductType,
    order_status: sale.order_status as ProductOrderStatus,
    payment_status: sale.payment_status as ProductPaymentStatus,
    payments: (sale.payments || []).map((payment: any) => ({
      ...payment,
      status: payment.status as PaymentStatus
    }))
  }));
}

export async function createProductSale(productSale: Omit<ProductSale, 'id' | 'created_at' | 'updated_at'>): Promise<ProductSale> {
  console.log("Creating product sale:", productSale);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('product_sales')
    .insert({
      ...productSale,
      user_id: user.id,
    })
    .select(`
      *,
      client:wedding_clients(id, name, email, phone),
      payments:product_payments(*)
    `)
    .single();

  if (error) {
    console.error("Error creating product sale:", error);
    throw error;
  }

  return {
    ...data,
    product_type: data.product_type as ProductType,
    order_status: data.order_status as ProductOrderStatus,
    payment_status: data.payment_status as ProductPaymentStatus,
    payments: (data.payments || []).map((payment: any) => ({
      ...payment,
      status: payment.status as PaymentStatus
    }))
  };
}

export async function updateProductSale(id: string, updates: Partial<ProductSale>): Promise<ProductSale> {
  console.log("Updating product sale:", id, updates);

  const { data, error } = await supabase
    .from('product_sales')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      client:wedding_clients(id, name, email, phone),
      payments:product_payments(*)
    `)
    .single();

  if (error) {
    console.error("Error updating product sale:", error);
    throw error;
  }

  return {
    ...data,
    product_type: data.product_type as ProductType,
    order_status: data.order_status as ProductOrderStatus,
    payment_status: data.payment_status as ProductPaymentStatus,
    payments: (data.payments || []).map((payment: any) => ({
      ...payment,
      status: payment.status as PaymentStatus
    }))
  };
}

export async function deleteProductSale(id: string): Promise<void> {
  console.log("Deleting product sale:", id);

  const { error } = await supabase
    .from('product_sales')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting product sale:", error);
    throw error;
  }
}

export async function createProductPayment(payment: Omit<ProductPayment, 'id' | 'created_at'>): Promise<ProductPayment> {
  console.log("Creating product payment:", payment);

  const { data, error } = await supabase
    .from('product_payments')
    .insert(payment)
    .select()
    .single();

  if (error) {
    console.error("Error creating product payment:", error);
    throw error;
  }

  return {
    ...data,
    status: data.status as PaymentStatus
  };
}

export async function updateProductPayment(id: string, updates: Partial<ProductPayment>): Promise<ProductPayment> {
  console.log("Updating product payment:", id, updates);

  const { data, error } = await supabase
    .from('product_payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product payment:", error);
    throw error;
  }

  return {
    ...data,
    status: data.status as PaymentStatus
  };
}

export async function deleteProductPayment(id: string): Promise<void> {
  console.log("Deleting product payment:", id);

  const { error } = await supabase
    .from('product_payments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting product payment:", error);
    throw error;
  }
}
