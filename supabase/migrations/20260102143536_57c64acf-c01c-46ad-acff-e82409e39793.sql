-- Create achievements definitions table
CREATE TABLE public.achievements (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'star',
  requirement INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  rarity TEXT NOT NULL DEFAULT 'common',
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can view achievements
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements 
FOR SELECT 
USING (true);

-- Insert achievement definitions
INSERT INTO public.achievements (id, title, description, icon, requirement, xp_reward, rarity, type) VALUES
('first_drill', 'First Steps', 'Complete your first drill', 'star', 1, 50, 'common', 'drills'),
('drill_5', 'Getting Started', 'Complete 5 drills', 'target', 5, 100, 'common', 'drills'),
('drill_25', 'Dedicated Learner', 'Complete 25 drills', 'award', 25, 250, 'rare', 'drills'),
('drill_50', 'Half Century', 'Complete 50 drills', 'trophy', 50, 500, 'rare', 'drills'),
('drill_100', 'Century Club', 'Complete 100 drills', 'crown', 100, 1000, 'epic', 'drills'),
('drill_250', 'Elite Trainer', 'Complete 250 drills', 'gem', 250, 2500, 'epic', 'drills'),
('drill_500', 'Master Athlete', 'Complete 500 drills', 'medal', 500, 5000, 'legendary', 'drills'),
('streak_3', 'On Fire', 'Maintain a 3-day streak', 'flame', 3, 75, 'common', 'streak'),
('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 'flame', 7, 150, 'common', 'streak'),
('streak_14', 'Fortnight Fighter', 'Maintain a 14-day streak', 'flame', 14, 300, 'rare', 'streak'),
('streak_30', 'Monthly Master', 'Maintain a 30-day streak', 'flame', 30, 750, 'rare', 'streak'),
('streak_60', 'Iron Will', 'Maintain a 60-day streak', 'flame', 60, 1500, 'epic', 'streak'),
('streak_100', 'Unstoppable', 'Maintain a 100-day streak', 'flame', 100, 3000, 'epic', 'streak'),
('streak_365', 'Year of Dedication', 'Maintain a 365-day streak', 'flame', 365, 10000, 'legendary', 'streak'),
('xp_1000', 'Rising Star', 'Earn 1,000 XP', 'zap', 1000, 100, 'common', 'xp'),
('xp_5000', 'Silver League', 'Earn 5,000 XP', 'zap', 5000, 500, 'rare', 'xp'),
('xp_15000', 'Gold League', 'Earn 15,000 XP', 'zap', 15000, 1500, 'epic', 'xp'),
('xp_50000', 'Diamond League', 'Earn 50,000 XP', 'zap', 50000, 5000, 'legendary', 'xp'),
('challenge_1', 'Challenger', 'Win your first challenge', 'swords', 1, 100, 'common', 'challenges'),
('challenge_10', 'Competitor', 'Win 10 challenges', 'swords', 10, 500, 'rare', 'challenges'),
('challenge_50', 'Champion', 'Win 50 challenges', 'swords', 50, 2500, 'epic', 'challenges'),
('friend_1', 'Social Butterfly', 'Add your first friend', 'users', 1, 50, 'common', 'social'),
('friend_10', 'Popular', 'Have 10 friends', 'users', 10, 250, 'rare', 'social'),
('friend_50', 'Influencer', 'Have 50 friends', 'users', 50, 1000, 'epic', 'social');

-- Create simulated profiles table for dummy users (no FK constraint to auth.users)
CREATE TABLE public.simulated_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '⚽',
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  league TEXT NOT NULL DEFAULT 'bronze',
  drills_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.simulated_profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view simulated profiles
CREATE POLICY "Simulated profiles are viewable by everyone" 
ON public.simulated_profiles 
FOR SELECT 
USING (true);