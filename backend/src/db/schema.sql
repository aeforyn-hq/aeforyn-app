-- AEFORYN Database Schema
-- Run this in your Supabase SQL editor

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  creator_handle TEXT,
  platforms_connected TEXT[] DEFAULT '{}',
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free','standard','pro','enterprise')),
  storage_used_bytes BIGINT DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan_tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.vault_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'general' CHECK (category IN ('video','image','document','credential','other','general')),
  is_encrypted BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.platforms_connected (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','tiktok','youtube','x','linkedin','email','facebook')),
  handle TEXT,
  health_score INTEGER DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
  last_checked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'monitoring' CHECK (status IN ('safe','warning','threat','monitoring')),
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.threats_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('login_attempt','phishing','account_takeover','suspicious_access','data_breach','other')),
  platform TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low','medium','high')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  red_flags TEXT[] DEFAULT '{}',
  explanation TEXT,
  recommendation TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.recovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned')),
  incident_report JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.plan_limits (
  plan_tier TEXT PRIMARY KEY,
  storage_bytes BIGINT NOT NULL,
  max_platforms INTEGER NOT NULL,
  monthly_scans INTEGER NOT NULL,
  has_recovery BOOLEAN DEFAULT FALSE,
  has_ai_assistant BOOLEAN DEFAULT FALSE,
  has_priority_support BOOLEAN DEFAULT FALSE
);

INSERT INTO public.plan_limits VALUES
  ('free',        2147483648,  1,   5, FALSE, FALSE, FALSE),
  ('standard',   10737418240,  5,  50, FALSE, TRUE,  FALSE),
  ('pro',        53687091200, -1, 999, TRUE,  TRUE,  TRUE),
  ('enterprise', 214748364800,-1, 999, TRUE,  TRUE,  TRUE);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms_connected ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threats_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their data" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own their subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their vault files" ON public.vault_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their platforms" ON public.platforms_connected FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their threats" ON public.threats_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their scans" ON public.scan_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their recovery sessions" ON public.recovery_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their AI conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
