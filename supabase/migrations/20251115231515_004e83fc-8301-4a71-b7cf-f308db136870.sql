-- Add subscription fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_expires_at timestamp with time zone;

-- Create subscriptions table to track Stripe subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'inactive',
  price_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own subscription
CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();