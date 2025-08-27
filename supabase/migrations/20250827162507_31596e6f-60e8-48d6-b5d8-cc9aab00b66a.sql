-- Fix search_path for all database functions

-- Update update_contract_templates_updated_at function
CREATE OR REPLACE FUNCTION public.update_contract_templates_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update generate_unique_token function
CREATE OR REPLACE FUNCTION public.generate_unique_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$function$;

-- Update update_budget_total function
CREATE OR REPLACE FUNCTION public.update_budget_total()
 RETURNS trigger
 LANGUAGE plpgsql  
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Atualizar o total do orçamento
  UPDATE public.budgets 
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM public.budget_items 
    WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update calculate_item_subtotal function
CREATE OR REPLACE FUNCTION public.calculate_item_subtotal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.subtotal = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update create_contract_form_for_client function
CREATE OR REPLACE FUNCTION public.create_contract_form_for_client(client_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  new_token TEXT;
  existing_form UUID;
BEGIN
  -- Check if client already has a form
  SELECT id INTO existing_form FROM contract_form_submissions WHERE client_id = client_id_param;
  
  IF existing_form IS NOT NULL THEN
    -- Client already has a form, return the existing token
    SELECT access_token INTO new_token FROM contract_form_submissions WHERE id = existing_form;
    RETURN new_token;
  END IF;
  
  -- Generate a unique token
  new_token := generate_unique_token();
  
  -- Create a new form entry with basic information from the client
  -- and default values for required fields
  INSERT INTO contract_form_submissions (
    client_id,
    access_token,
    -- Initialize with existing client data if available
    bride_name,
    contact_email,
    contact_phone,
    -- Add default values for required fields
    groom_name,
    bride_id,
    bride_cpf,
    complete_address,
    event_date,
    event_time,
    event_location,
    event_address,
    contracted_package,
    total_value,
    payment_method,
    accepts_terms
  )
  SELECT
    id,
    new_token,
    name,
    email,
    phone,
    -- Default values for required fields
    'Preencher', -- groom_name
    'Preencher', -- bride_id
    'Preencher', -- bride_cpf
    'Preencher', -- complete_address
    CURRENT_DATE, -- event_date
    '00:00:00', -- event_time
    'Preencher', -- event_location
    'Preencher', -- event_address
    'Preencher', -- contracted_package
    0, -- total_value
    'Preencher', -- payment_method
    true -- accepts_terms
  FROM
    wedding_clients
  WHERE
    id = client_id_param;
  
  RETURN new_token;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$function$;