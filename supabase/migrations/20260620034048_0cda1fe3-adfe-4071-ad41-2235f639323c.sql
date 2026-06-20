ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_goal integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS client_state jsonb NOT NULL DEFAULT '{}'::jsonb;