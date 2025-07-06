
-- Create website_previews table
CREATE TABLE public.website_previews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  screenshot_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.website_previews ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read active website previews
CREATE POLICY "Anyone can view active website previews" 
  ON public.website_previews 
  FOR SELECT 
  USING (is_active = true);

-- Policy to allow authenticated users to manage website previews
CREATE POLICY "Authenticated users can manage website previews" 
  ON public.website_previews 
  FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for performance
CREATE INDEX idx_website_previews_display_order ON public.website_previews(display_order);
CREATE INDEX idx_website_previews_is_active ON public.website_previews(is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_website_previews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER website_previews_updated_at
  BEFORE UPDATE ON public.website_previews
  FOR EACH ROW
  EXECUTE FUNCTION update_website_previews_updated_at();
