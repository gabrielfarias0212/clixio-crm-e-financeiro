-- Migration: cria tabela de tarefas do Dashboard
-- Execute no SQL Editor do Supabase → New query → Run

CREATE TABLE IF NOT EXISTS public.dashboard_tasks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text         TEXT NOT NULL,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_user_id ON public.dashboard_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_created_at ON public.dashboard_tasks(created_at DESC);

-- Trigger: preenche user_id automaticamente com o usuário autenticado
CREATE OR REPLACE FUNCTION public.set_dashboard_task_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_dashboard_tasks_user_id
  BEFORE INSERT ON public.dashboard_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_dashboard_task_user_id();

ALTER TABLE public.dashboard_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own tasks"
  ON public.dashboard_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.dashboard_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.dashboard_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.dashboard_tasks FOR DELETE
  USING (auth.uid() = user_id);
