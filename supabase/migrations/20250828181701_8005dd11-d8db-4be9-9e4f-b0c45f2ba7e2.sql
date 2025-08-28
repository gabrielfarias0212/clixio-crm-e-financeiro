-- CRITICAL SECURITY FIX: Fix data exposure vulnerabilities (Corrected)
-- This migration addresses 5 critical security vulnerabilities identified in the security scan

-- 1. Add user_id columns to tables that need proper user isolation
ALTER TABLE wedding_clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE wedding_payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);  
ALTER TABLE wedding_transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Remove dangerous "Enable all operations" policies
DROP POLICY IF EXISTS "Enable all operations for wedding_clients" ON wedding_clients;
DROP POLICY IF EXISTS "Enable all operations for wedding_payments" ON wedding_payments;
DROP POLICY IF EXISTS "Enable all operations for wedding_transactions" ON wedding_transactions;

-- 3. Create secure user-scoped RLS policies for wedding_clients
CREATE POLICY "Users can view their own clients" ON wedding_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" ON wedding_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON wedding_clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON wedding_clients
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create secure user-scoped RLS policies for wedding_payments
CREATE POLICY "Users can view their own payments" ON wedding_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON wedding_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON wedding_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" ON wedding_payments
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create secure user-scoped RLS policies for wedding_transactions
CREATE POLICY "Users can view their own transactions" ON wedding_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON wedding_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON wedding_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON wedding_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Restrict client_credentials table access
DROP POLICY IF EXISTS "Allow access to view client credentials" ON client_credentials;
DROP POLICY IF EXISTS "Allow photographers to insert client credentials" ON client_credentials;

CREATE POLICY "Photographers can manage their own client credentials" ON client_credentials
  FOR ALL USING (auth.uid() = photographer_id);

CREATE POLICY "Clients can view their own credentials" ON client_credentials
  FOR SELECT USING (auth.uid()::text = id::text);

-- 7. Restrict photographers table access  
DROP POLICY IF EXISTS "Allow anonymous users to view photographers" ON photographers;
DROP POLICY IF EXISTS "Allow anonymous users to insert photographers" ON photographers;
DROP POLICY IF EXISTS "Photographers can view their own data" ON photographers;

CREATE POLICY "Secure photographer data access" ON photographers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Allow authenticated photographer registration" ON photographers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');