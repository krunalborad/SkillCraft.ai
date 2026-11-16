-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- LESSON PROGRESS
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_slug, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON public.lesson_progress FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_lesson_progress_user_course ON public.lesson_progress(user_id, course_slug);

-- LESSON NOTES
CREATE TABLE public.lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_slug, lesson_id)
);
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notes" ON public.lesson_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notes" ON public.lesson_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON public.lesson_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON public.lesson_notes FOR DELETE USING (auth.uid() = user_id);

-- CERTIFICATES
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_slug)
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates viewable by everyone" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lesson_notes_updated_at BEFORE UPDATE ON public.lesson_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();