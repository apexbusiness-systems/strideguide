-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'fr')),
  country TEXT DEFAULT 'CA' CHECK (country IN ('CA', 'US', 'FR', 'DE', 'IT', 'ES')),
  timezone TEXT DEFAULT 'America/Toronto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learned items table for lost item finder
CREATE TABLE public.learned_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  embeddings JSONB, -- Store ML embeddings
  photos_count INTEGER DEFAULT 0,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
  is_encrypted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency recordings table
CREATE TABLE public.emergency_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  recording_type TEXT DEFAULT 'emergency' CHECK (recording_type IN ('emergency', 'fall_detection', 'manual')),
  duration_seconds INTEGER,
  file_path TEXT, -- Path to audio file in storage
  transcription TEXT,
  location_data JSONB, -- GPS coordinates, address
  contacts_notified JSONB, -- Which contacts were notified
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- Accessibility settings
  voice_guidance_enabled BOOLEAN DEFAULT TRUE,
  haptic_feedback_enabled BOOLEAN DEFAULT TRUE,
  voice_speed DECIMAL(2,1) DEFAULT 1.0 CHECK (voice_speed BETWEEN 0.5 AND 2.0),
  volume_level DECIMAL(3,2) DEFAULT 0.8 CHECK (volume_level BETWEEN 0.0 AND 1.0),
  high_contrast_mode BOOLEAN DEFAULT FALSE,
  large_text_mode BOOLEAN DEFAULT FALSE,
  -- Privacy settings
  telemetry_enabled BOOLEAN DEFAULT FALSE,
  location_tracking_enabled BOOLEAN DEFAULT TRUE,
  emergency_auto_call BOOLEAN DEFAULT TRUE,
  -- App behavior
  offline_mode_preferred BOOLEAN DEFAULT TRUE,
  winter_mode_enabled BOOLEAN DEFAULT FALSE,
  low_end_device_mode BOOLEAN DEFAULT FALSE,
  battery_saver_mode BOOLEAN DEFAULT FALSE,
  -- ML settings
  ml_confidence_threshold DECIMAL(3,2) DEFAULT 0.55,
  object_detection_enabled BOOLEAN DEFAULT TRUE,
  fall_detection_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage analytics table (privacy-preserving)
CREATE TABLE public.usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB, -- Coarse, anonymized data only
  session_id TEXT,
  device_type TEXT,
  app_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for emergency contacts
CREATE POLICY "Users can manage their own emergency contacts" ON public.emergency_contacts
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for learned items
CREATE POLICY "Users can manage their own learned items" ON public.learned_items
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for emergency recordings
CREATE POLICY "Users can manage their own emergency recordings" ON public.emergency_recordings
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user settings
CREATE POLICY "Users can manage their own settings" ON public.user_settings
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for usage analytics
CREATE POLICY "Users can view their own analytics" ON public.usage_analytics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON public.usage_analytics
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learned_items_updated_at
  BEFORE UPDATE ON public.learned_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_recordings_updated_at
  BEFORE UPDATE ON public.emergency_recordings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Create default user settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX idx_learned_items_user_id ON public.learned_items(user_id);
CREATE INDEX idx_emergency_recordings_user_id ON public.emergency_recordings(user_id);
CREATE INDEX idx_emergency_recordings_status ON public.emergency_recordings(status);
CREATE INDEX idx_usage_analytics_user_id ON public.usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_event_type ON public.usage_analytics(event_type);
CREATE INDEX idx_usage_analytics_created_at ON public.usage_analytics(created_at);