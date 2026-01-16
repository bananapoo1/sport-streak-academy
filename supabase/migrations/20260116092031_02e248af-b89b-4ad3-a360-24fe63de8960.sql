-- Create daily_spins table to enforce server-side spin limits
CREATE TABLE public.daily_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_id TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, spin_date)
);

-- Enable RLS
ALTER TABLE public.daily_spins ENABLE ROW LEVEL SECURITY;

-- Users can only view their own spins
CREATE POLICY "Users can view own spins"
ON public.daily_spins
FOR SELECT
USING (user_id = auth.uid());

-- Users can only insert their own spins (with unique constraint preventing duplicates)
CREATE POLICY "Users can insert own spin"
ON public.daily_spins
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add index for efficient lookups
CREATE INDEX idx_daily_spins_user_date ON public.daily_spins(user_id, spin_date);