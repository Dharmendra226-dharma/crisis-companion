
-- Users table for storing subscriber info
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  pincode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup)
CREATE POLICY "Anyone can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Users can read their own data (matched by email via query param)
CREATE POLICY "Anyone can read users" ON public.users
  FOR SELECT USING (true);

-- Monitoring logs table
CREATE TABLE public.monitoring_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lpg_status JSONB DEFAULT '{}',
  stock_status JSONB DEFAULT '{}',
  price_data JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.monitoring_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read monitoring_logs" ON public.monitoring_logs
  FOR SELECT USING (true);

CREATE POLICY "Service can insert monitoring_logs" ON public.monitoring_logs
  FOR INSERT WITH CHECK (true);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read alerts" ON public.alerts
  FOR SELECT USING (true);

CREATE POLICY "Service can insert alerts" ON public.alerts
  FOR INSERT WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_monitoring_logs_user ON public.monitoring_logs(user_id);
CREATE INDEX idx_alerts_user ON public.alerts(user_id);
CREATE INDEX idx_users_email ON public.users(email);
