-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Utilizador'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create cars table
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  mileage INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  location_province TEXT NOT NULL,
  location_city TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS policies for cars
CREATE POLICY "Anyone can view active cars"
  ON public.cars FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create their own cars"
  ON public.cars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cars"
  ON public.cars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cars"
  ON public.cars FOR DELETE
  USING (auth.uid() = user_id);

-- Create car_images table
CREATE TABLE public.car_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for car_images
CREATE POLICY "Anyone can view car images"
  ON public.car_images FOR SELECT
  USING (true);

CREATE POLICY "Users can manage images for their cars"
  ON public.car_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cars
      WHERE cars.id = car_images.car_id
      AND cars.user_id = auth.uid()
    )
  );

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, car_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorites
CREATE POLICY "Users can view their favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id);

-- Create views table for analytics
CREATE TABLE public.car_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.car_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for car_views
CREATE POLICY "Anyone can record views"
  ON public.car_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Car owners can view their car analytics"
  ON public.car_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cars
      WHERE cars.id = car_views.car_id
      AND cars.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_cars_user_id ON public.cars(user_id);
CREATE INDEX idx_cars_status ON public.cars(status);
CREATE INDEX idx_cars_brand ON public.cars(brand);
CREATE INDEX idx_cars_price ON public.cars(price);
CREATE INDEX idx_cars_created_at ON public.cars(created_at DESC);
CREATE INDEX idx_car_images_car_id ON public.car_images(car_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_car ON public.favorites(car_id);