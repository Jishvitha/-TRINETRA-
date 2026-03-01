-- Add phone field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update handle_new_user function to support phone
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
  
  -- Extract username from email (remove @miaoda.com) or use phone
  IF NEW.email IS NOT NULL THEN
    extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  ELSE
    extracted_username := COALESCE(NEW.phone, 'user_' || NEW.id::text);
  END IF;
  
  -- Get user metadata
  user_metadata := NEW.raw_user_meta_data;
  
  -- Insert profile with role and additional fields
  INSERT INTO public.profiles (
    id, 
    username, 
    email,
    phone,
    role,
    full_name,
    official_email,
    police_id,
    police_station,
    verified
  )
  VALUES (
    NEW.id,
    COALESCE(user_metadata->>'username', extracted_username),
    NEW.email,
    NEW.phone,
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