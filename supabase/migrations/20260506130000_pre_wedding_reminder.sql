ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS pre_wedding_reminder_days integer DEFAULT 90;
