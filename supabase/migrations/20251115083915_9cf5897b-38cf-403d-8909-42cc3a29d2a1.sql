-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images', 
  'car-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for car images
CREATE POLICY "Anyone can view car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can upload car images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'car-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own car images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'car-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own car images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'car-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add mixero fields to cars table
ALTER TABLE public.cars
ADD COLUMN has_mixero BOOLEAN DEFAULT false,
ADD COLUMN mixero_commission NUMERIC CHECK (mixero_commission >= 0 AND mixero_commission <= 100);

COMMENT ON COLUMN public.cars.has_mixero IS 'Indica se o anúncio inclui um mixero (corretor)';
COMMENT ON COLUMN public.cars.mixero_commission IS 'Percentagem de comissão do mixero (0-100)';