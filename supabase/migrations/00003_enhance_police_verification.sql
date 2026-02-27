-- Add new fields to profiles table
ALTER TABLE profiles ADD COLUMN full_name TEXT;
ALTER TABLE profiles ADD COLUMN official_email TEXT;
ALTER TABLE profiles ADD COLUMN police_id TEXT;
ALTER TABLE profiles ADD COLUMN police_station TEXT;
ALTER TABLE profiles ADD COLUMN id_proof_url TEXT;
ALTER TABLE profiles ADD COLUMN verified BOOLEAN DEFAULT false;

-- Create police_ids table for verification simulation
CREATE TABLE police_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  police_id TEXT UNIQUE NOT NULL,
  station_name TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some sample valid police IDs for testing
INSERT INTO police_ids (police_id, station_name, is_valid) VALUES
  ('POL001', 'Central Police Station', true),
  ('POL002', 'North District Station', true),
  ('POL003', 'South District Station', true),
  ('POL004', 'East District Station', true),
  ('POL005', 'West District Station', true),
  ('DEMO123', 'Demo Police Station', true);

-- Enable RLS on police_ids
ALTER TABLE police_ids ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read police_ids for verification
CREATE POLICY "Anyone can read police_ids for verification" ON police_ids
  FOR SELECT
  USING (true);

-- Create function to verify police ID
CREATE OR REPLACE FUNCTION verify_police_id(pid text)
RETURNS TABLE(is_valid boolean, station_name text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT is_valid, station_name
  FROM police_ids
  WHERE police_id = pid
  LIMIT 1;
$$;

-- Update handle_new_user function to support police registration with verification
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
  user_metadata jsonb;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (remove @miaoda.com)
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  -- Get user metadata
  user_metadata := NEW.raw_user_meta_data;
  
  -- Insert profile with role and additional fields
  INSERT INTO public.profiles (
    id, 
    username, 
    email, 
    role,
    full_name,
    official_email,
    police_id,
    police_station,
    verified
  )
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    COALESCE((user_metadata->>'role')::user_role, 'citizen'::user_role),
    user_metadata->>'full_name',
    user_metadata->>'official_email',
    user_metadata->>'police_id',
    user_metadata->>'police_station',
    COALESCE((user_metadata->>'verified')::boolean, false)
  );
  
  RETURN NEW;
END;
$$;