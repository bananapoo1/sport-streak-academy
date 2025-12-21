-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  drill_id TEXT NOT NULL,
  sport TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'expired')),
  challenger_score INTEGER,
  challenged_score INTEGER,
  winner_id UUID REFERENCES public.profiles(id),
  xp_bonus INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view challenges they're part of" 
ON public.challenges FOR SELECT 
USING (challenger_id = auth.uid() OR challenged_id = auth.uid());

CREATE POLICY "Users can create challenges" 
ON public.challenges FOR INSERT 
WITH CHECK (challenger_id = auth.uid());

CREATE POLICY "Users can update challenges they're part of" 
ON public.challenges FOR UPDATE 
USING (challenger_id = auth.uid() OR challenged_id = auth.uid());

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own achievements" 
ON public.user_achievements FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievements" 
ON public.user_achievements FOR UPDATE 
USING (user_id = auth.uid());