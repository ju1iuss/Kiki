-- Create mockups table
CREATE TABLE IF NOT EXISTS mockups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  logo_url TEXT,
  aesthetic_vibe TEXT,
  platform TEXT,
  content_type TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_mockups table
CREATE TABLE IF NOT EXISTS saved_mockups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mockup_id UUID NOT NULL REFERENCES mockups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mockup_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mockups_user_id ON mockups(user_id);
CREATE INDEX IF NOT EXISTS idx_mockups_created_at ON mockups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_mockups_user_id ON saved_mockups(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_mockups_mockup_id ON saved_mockups(mockup_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_mockups_updated_at
  BEFORE UPDATE ON mockups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE mockups ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_mockups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mockups
CREATE POLICY "Users can view all mockups"
  ON mockups FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own mockups"
  ON mockups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mockups"
  ON mockups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mockups"
  ON mockups FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_mockups
CREATE POLICY "Users can view their own saved mockups"
  ON saved_mockups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save mockups"
  ON saved_mockups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own saved mockups"
  ON saved_mockups FOR DELETE
  USING (auth.uid() = user_id);

