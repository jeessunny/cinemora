-- =============================================================================
-- Cinemora Supabase Schema & Migrations
-- Run this in the Supabase Dashboard -> SQL Editor -> New Query
-- =============================================================================

-- ==========================================
-- RUN THESE MIGRATIONS IF YOU ALREADY CREATED THE DB:
-- ==========================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selected_languages TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS floating_nav_bar BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nav_search_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_sections JSONB;
-- ==========================================

-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (Stores Settings & User Info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_name TEXT,
  avatar_url TEXT,
  theme_mode TEXT DEFAULT 'dark',
  accent_color TEXT DEFAULT '#FF3355',
  animations_enabled BOOLEAN DEFAULT true,
  nav_settings_enabled BOOLEAN DEFAULT true,
  glassmorphism_enabled BOOLEAN DEFAULT true,
  selected_genres TEXT[] DEFAULT '{}',
  selected_languages TEXT[] DEFAULT '{}',
  floating_nav_bar BOOLEAN DEFAULT true,
  nav_search_enabled BOOLEAN DEFAULT true,
  home_sections JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Create User Movies Table (Watchlist, Favorites, History)
CREATE TABLE public.user_movies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INT NOT NULL,
  movie_type TEXT DEFAULT 'movie',
  status TEXT NOT NULL, -- 'watchlist', 'favorite', or 'history'
  movie_data JSONB NOT NULL, -- Stores poster, title, etc.
  watched_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, movie_id, status) -- Prevent duplicates
);

ALTER TABLE public.user_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own movies" ON public.user_movies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movies" ON public.user_movies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movies" ON public.user_movies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own movies" ON public.user_movies
  FOR DELETE USING (auth.uid() = user_id);


-- 3. Create User Activity Table (For Custom Recommendation Algorithm)
CREATE TABLE public.user_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INT NOT NULL,
  genres TEXT[] NOT NULL,
  action_type TEXT NOT NULL, -- 'view', 'favorite', 'history'
  weight INT NOT NULL, -- e.g., view=1, favorite=3, history=5
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);
