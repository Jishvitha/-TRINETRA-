-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('police', 'citizen');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  role user_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (remove @miaoda.com)
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  -- Insert profile with role (first user is police, rest are citizens)
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'police'::public.user_role ELSE 'citizen'::public.user_role END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-sync on user confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Helper function to check if user is police
CREATE OR REPLACE FUNCTION is_police(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'police'::user_role
  );
$$;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Police have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_police(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Create public view for shareable profile info
CREATE VIEW public_profiles AS
  SELECT id, username, role FROM profiles;

-- Update alerts table policies for role-based access
DROP POLICY IF EXISTS "Public insert alerts" ON alerts;
DROP POLICY IF EXISTS "Public update alerts" ON alerts;

-- Only police can create and update alerts
CREATE POLICY "Police can insert alerts" ON alerts
  FOR INSERT TO authenticated
  WITH CHECK (is_police(auth.uid()));

CREATE POLICY "Police can update alerts" ON alerts
  FOR UPDATE TO authenticated
  USING (is_police(auth.uid()));

-- Everyone can read alerts (but we'll filter resolved ones in the app)
CREATE POLICY "Anyone can read alerts" ON alerts
  FOR SELECT TO authenticated
  USING (true);

-- Update sightings policies
DROP POLICY IF EXISTS "Public insert sightings" ON sightings;

-- Only authenticated users can create sightings
CREATE POLICY "Authenticated users can insert sightings" ON sightings
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add reporter_id to sightings table
ALTER TABLE sightings ADD COLUMN reporter_id UUID REFERENCES profiles(id);

-- Add photo_url to sightings for camera captures
ALTER TABLE sightings ADD COLUMN photo_url TEXT;