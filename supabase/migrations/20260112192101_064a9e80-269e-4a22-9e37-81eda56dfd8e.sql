-- Create business fixed expenses table
CREATE TABLE public.business_fixed_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date INTEGER NULL, -- Day of month (1-31)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_fixed_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own business fixed expenses" 
ON public.business_fixed_expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own business fixed expenses" 
ON public.business_fixed_expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business fixed expenses" 
ON public.business_fixed_expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business fixed expenses" 
ON public.business_fixed_expenses 
FOR DELETE 
USING (auth.uid() = user_id);