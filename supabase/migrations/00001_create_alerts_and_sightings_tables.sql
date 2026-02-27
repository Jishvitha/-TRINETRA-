-- Create storage bucket for child photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-9wcfw5spx1q9_child_images',
  'app-9wcfw5spx1q9_child_images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
);

-- Storage policies for public read and write
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-9wcfw5spx1q9_child_images');

CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-9wcfw5spx1q9_child_images');

-- Create alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  last_seen_location TEXT NOT NULL,
  last_seen_lat DECIMAL(10, 8),
  last_seen_lng DECIMAL(11, 8),
  time_missing TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sightings table
CREATE TABLE sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  description TEXT,
  reporter_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_sightings_alert_id ON sightings(alert_id);
CREATE INDEX idx_sightings_created_at ON sightings(created_at DESC);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;

-- Policies for alerts (public read, public write for demo)
CREATE POLICY "Public read alerts"
ON alerts FOR SELECT
USING (true);

CREATE POLICY "Public insert alerts"
ON alerts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update alerts"
ON alerts FOR UPDATE
USING (true);

-- Policies for sightings (public read and write)
CREATE POLICY "Public read sightings"
ON sightings FOR SELECT
USING (true);

CREATE POLICY "Public insert sightings"
ON sightings FOR INSERT
WITH CHECK (true);