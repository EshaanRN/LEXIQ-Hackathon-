
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exam text NOT NULL DEFAULT 'sat',
  ADD COLUMN IF NOT EXISTS checkpoint_interval integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS mastery_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS words_learned_total integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_checkpoint_at timestamptz;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_exam_check CHECK (exam IN ('sat','act','both'));
