-- Create app_config table for centralized constants
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS (read-only for all, write for service role only)
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App config is publicly readable"
  ON public.app_config
  FOR SELECT
  USING (true);

-- Insert default configuration values
INSERT INTO public.app_config (key, value, description) VALUES
  ('DAILY_GOAL_MINUTES', '30', 'Default daily training goal in minutes'),
  ('FREE_DRILL_LIMIT_PER_DAY', '1', 'Maximum drills a free user can complete per day'),
  ('XP_MULTIPLIER', '1', 'Global XP multiplier applied to all drills'),
  ('CHALLENGE_XP_BONUS', '50', 'Bonus XP awarded to challenge winners'),
  ('STREAK_FREEZE_MAX', '3', 'Maximum streak freezes a user can hold'),
  ('MIN_SCORE', '0', 'Minimum valid score for challenges'),
  ('MAX_SCORE', '1000', 'Maximum valid score for challenges')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- Create trigger for updated_at
CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();