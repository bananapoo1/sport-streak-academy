-- Create profiles table with full social features
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  bio TEXT,
  location TEXT,
  avatar_id TEXT DEFAULT 'default',
  frame_id TEXT DEFAULT 'none',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  social_links JSONB DEFAULT '{}',
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily progress tracking
CREATE TABLE public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  minutes_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  drills_completed INTEGER DEFAULT 0,
  goal_minutes INTEGER DEFAULT 10,
  UNIQUE(user_id, date)
);

-- Create completed drills tracking
CREATE TABLE public.completed_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sport TEXT NOT NULL,
  drill_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, drill_id)
);

-- Create friends table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create streak reminders preferences
CREATE TABLE public.reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  in_app_reminders BOOLEAN DEFAULT true,
  email_reminders BOOLEAN DEFAULT false,
  reminder_time TIME DEFAULT '18:00:00'
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (visibility = 'public' OR id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (id = auth.uid());

-- Daily progress policies
CREATE POLICY "Users can view own progress" 
ON public.daily_progress FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" 
ON public.daily_progress FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" 
ON public.daily_progress FOR UPDATE 
USING (user_id = auth.uid());

-- Completed drills policies
CREATE POLICY "Users can view own completed drills" 
ON public.completed_drills FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own completed drills" 
ON public.completed_drills FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Friendships policies
CREATE POLICY "Users can view own friendships" 
ON public.friendships FOR SELECT 
USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendship requests" 
ON public.friendships FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update friendships they're part of" 
ON public.friendships FOR UPDATE 
USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can delete own friendships" 
ON public.friendships FOR DELETE 
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Reminder settings policies
CREATE POLICY "Users can view own reminder settings" 
ON public.reminder_settings FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reminder settings" 
ON public.reminder_settings FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reminder settings" 
ON public.reminder_settings FOR UPDATE 
USING (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'username');
  
  INSERT INTO public.reminder_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();