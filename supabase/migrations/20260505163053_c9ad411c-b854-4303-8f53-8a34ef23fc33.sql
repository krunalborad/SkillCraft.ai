CREATE TABLE public.solved_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_title text NOT NULL,
  difficulty text NOT NULL,
  language text NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  solved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_title)
);

ALTER TABLE public.solved_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own solved" ON public.solved_challenges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own solved" ON public.solved_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own solved" ON public.solved_challenges
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_solved_user ON public.solved_challenges(user_id);