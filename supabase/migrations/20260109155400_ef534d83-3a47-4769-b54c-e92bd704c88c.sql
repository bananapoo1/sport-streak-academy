-- Add streak_freezes column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS streak_freezes integer DEFAULT 0;

-- Create weekly_leaderboard view for easy querying
CREATE OR REPLACE VIEW public.weekly_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_id,
  p.current_streak,
  COALESCE(SUM(dp.xp_earned), 0) as weekly_xp,
  COUNT(dp.id) as days_active
FROM public.profiles p
LEFT JOIN public.daily_progress dp ON p.id = dp.user_id 
  AND dp.date >= CURRENT_DATE - INTERVAL '7 days'
WHERE p.visibility = 'public'
GROUP BY p.id, p.username, p.display_name, p.avatar_id, p.current_streak
ORDER BY weekly_xp DESC;

-- Create streak_freeze_log table to track usage
CREATE TABLE IF NOT EXISTS public.streak_freeze_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_at timestamp with time zone NOT NULL DEFAULT now(),
  date_protected date NOT NULL
);

-- Enable RLS on streak_freeze_log
ALTER TABLE public.streak_freeze_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for streak_freeze_log
CREATE POLICY "Users can view own freeze log"
ON public.streak_freeze_log FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own freeze log"
ON public.streak_freeze_log FOR INSERT
WITH CHECK (user_id = auth.uid());