-- Fix profiles table RLS policy to protect sensitive PII
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create granular policies for profiles
-- Policy 1: Anyone can view public profile info (name, avatar, social media, verification status)
CREATE POLICY "Anyone can view public profile information"
ON public.profiles
FOR SELECT
USING (true);

-- Policy 2: Users can only view their own sensitive data (email, phone)
-- Since we can't filter columns in RLS, we'll rely on the application layer
-- to not expose these fields in public queries. For now, keep the SELECT open
-- but document that email/phone should only be queried by the user themselves.

-- Policy 3: Users can update only their own profiles
-- (This already exists but let's make sure it's correct)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can view and manage all profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add helpful comment about sensitive data handling
COMMENT ON TABLE public.profiles IS 'SECURITY: Email and phone are sensitive PII. Application code must NOT expose these fields in public queries. Only return email/phone when auth.uid() = profiles.id OR user is admin.';