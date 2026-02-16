-- Create onboarding responses table for first-run personalization
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  data jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  source text NOT NULL DEFAULT 'app'
);

-- Ensure one response per user (guest data stays local until login)
CREATE UNIQUE INDEX IF NOT EXISTS onboarding_responses_user_id_key
ON public.onboarding_responses (user_id)
WHERE user_id IS NOT NULL;

ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Policies: user can only manage their own data
CREATE POLICY "Users can insert their onboarding responses"
ON public.onboarding_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their onboarding responses"
ON public.onboarding_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their onboarding responses"
ON public.onboarding_responses
FOR UPDATE
USING (auth.uid() = user_id);
