-- Enable RLS on calendar_events table
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view their own calendar events" 
ON public.calendar_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

CREATE POLICY "Users can create their own calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

CREATE POLICY "Users can update their own calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

-- Enable RLS on contract_form_submissions table
ALTER TABLE public.contract_form_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_form_submissions
CREATE POLICY "Users can view contract forms for their clients" 
ON public.contract_form_submissions 
FOR SELECT 
USING (
  client_id IN (
    SELECT id FROM public.wedding_clients 
    WHERE auth.uid() IS NOT NULL
  )
  OR auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can create contract forms" 
ON public.contract_form_submissions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update contract forms for their clients" 
ON public.contract_form_submissions 
FOR UPDATE 
USING (
  client_id IN (
    SELECT id FROM public.wedding_clients 
    WHERE auth.uid() IS NOT NULL
  )
  OR auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete contract forms for their clients" 
ON public.contract_form_submissions 
FOR DELETE 
USING (
  client_id IN (
    SELECT id FROM public.wedding_clients 
    WHERE auth.uid() IS NOT NULL
  )
  OR auth.uid() IS NOT NULL
);

-- Enable RLS on sessions table
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sessions
CREATE POLICY "Users can view their own sessions" 
ON public.sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.sessions 
FOR DELETE 
USING (auth.uid() = user_id);