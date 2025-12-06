-- Create brand_assets table
CREATE TABLE IF NOT EXISTS brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logos JSONB DEFAULT '[]'::jsonb,
  headlines JSONB DEFAULT '[]'::jsonb,
  secondary_images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_brand_assets_user_id ON brand_assets(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_brand_assets_updated_at
  BEFORE UPDATE ON brand_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_assets
CREATE POLICY "Users can view their own brand assets"
  ON brand_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand assets"
  ON brand_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand assets"
  ON brand_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand assets"
  ON brand_assets FOR DELETE
  USING (auth.uid() = user_id);

