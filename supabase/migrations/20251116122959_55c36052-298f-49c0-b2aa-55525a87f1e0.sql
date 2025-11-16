-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can view active cars" ON public.cars;

-- Create a new, simplified policy that clearly allows anyone to view active cars
CREATE POLICY "Anyone can view active cars" ON public.cars
FOR SELECT USING (
  status = 'active'::text 
  OR (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)))
);