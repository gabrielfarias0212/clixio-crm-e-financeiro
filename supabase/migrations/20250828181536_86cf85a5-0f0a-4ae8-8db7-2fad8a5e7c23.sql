-- CRITICAL SECURITY FIX: Fix data exposure vulnerabilities
-- This migration addresses 5 critical security vulnerabilities identified in the security scan

-- 1. Add user_id columns to tables that need proper user isolation
ALTER TABLE wedding_clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE wedding_payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);  
ALTER TABLE wedding_transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Update existing data to associate with current authenticated users
-- Note: This will need to be run by the business owner when logged in
-- UPDATE wedding_clients SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE wedding_payments SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE wedding_transactions SET user_id = auth.uid() WHERE user_id IS NULL;

-- 3. Remove dangerous "Enable all operations" policies
DROP POLICY IF EXISTS "Enable all operations for wedding_clients" ON wedding_clients;
DROP POLICY IF EXISTS "Enable all operations for wedding_payments" ON wedding_payments;
DROP POLICY IF EXISTS "Enable all operations for wedding_transactions" ON wedding_transactions;

-- 4. Create secure user-scoped RLS policies for wedding_clients
CREATE POLICY "Users can view their own clients" ON wedding_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" ON wedding_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON wedding_clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON wedding_clients
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create secure user-scoped RLS policies for wedding_payments
CREATE POLICY "Users can view their own payments" ON wedding_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON wedding_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON wedding_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" ON wedding_payments
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create secure user-scoped RLS policies for wedding_transactions
CREATE POLICY "Users can view their own transactions" ON wedding_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON wedding_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON wedding_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON wedding_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Restrict client_credentials table access
DROP POLICY IF EXISTS "Allow access to view client credentials" ON client_credentials;
DROP POLICY IF EXISTS "Allow photographers to insert client credentials" ON client_credentials;

CREATE POLICY "Photographers can manage their own client credentials" ON client_credentials
  FOR ALL USING (auth.uid() = photographer_id);

CREATE POLICY "Clients can view their own credentials" ON client_credentials
  FOR SELECT USING (auth.uid()::text = id::text);

-- 8. Restrict photographers table access  
DROP POLICY IF EXISTS "Allow anonymous users to view photographers" ON photographers;
DROP POLICY IF EXISTS "Allow anonymous users to insert photographers" ON photographers;

CREATE POLICY "Photographers can view their own data" ON photographers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Allow authenticated users to insert photographers" ON photographers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. Make user_id columns NOT NULL for proper enforcement (after data migration)
-- Note: Uncomment these after running the UPDATE statements above
-- ALTER TABLE wedding_clients ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE wedding_payments ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE wedding_transactions ALTER COLUMN user_id SET NOT NULL;