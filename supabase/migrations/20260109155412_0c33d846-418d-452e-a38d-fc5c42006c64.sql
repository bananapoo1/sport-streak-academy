-- Drop the SECURITY DEFINER view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.weekly_leaderboard;

CREATE VIEW public.weekly_leaderboard 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_id,
  p.current_streak,
  COALESCE(SUM(dp.xp_earned), 0)::bigint as weekly_xp,
  COUNT(dp.id)::bigint as days_active
FROM public.profiles p
LEFT JOIN public.daily_progress dp ON p.id = dp.user_id 
  AND dp.date >= CURRENT_DATE - INTERVAL '7 days'
WHERE p.visibility = 'public'
GROUP BY p.id, p.username, p.display_name, p.avatar_id, p.current_streak
ORDER BY weekly_xp DESC;