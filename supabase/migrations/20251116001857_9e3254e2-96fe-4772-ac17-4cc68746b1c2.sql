-- Create table for activation codes
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id UUID,
  transaction_number TEXT,
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own codes
CREATE POLICY "Users can view their own activation codes"
ON public.activation_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own codes
CREATE POLICY "Users can insert their own activation codes"
ON public.activation_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create table for chat messages
CREATE TABLE IF NOT EXISTS public.premium_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.premium_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own chat messages"
ON public.premium_chat_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own chat messages"
ON public.premium_chat_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to activate premium with code
CREATE OR REPLACE FUNCTION public.activate_premium_with_code(activation_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record RECORD;
  user_profile_id UUID;
BEGIN
  user_profile_id := auth.uid();
  
  IF user_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuário não autenticado');
  END IF;

  -- Get activation code
  SELECT * INTO code_record
  FROM public.activation_codes
  WHERE code = activation_code
  AND status = 'approved'
  AND expires_at > now();

  IF code_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou expirado');
  END IF;

  -- Update user to premium
  UPDATE public.profiles
  SET 
    is_premium = true,
    premium_expires_at = now() + interval '30 days',
    updated_at = now()
  WHERE id = user_profile_id;

  -- Mark code as activated
  UPDATE public.activation_codes
  SET 
    user_id = user_profile_id,
    status = 'activated',
    activated_at = now()
  WHERE id = code_record.id;

  RETURN jsonb_build_object('success', true, 'message', 'Premium ativado com sucesso');
END;
$$;