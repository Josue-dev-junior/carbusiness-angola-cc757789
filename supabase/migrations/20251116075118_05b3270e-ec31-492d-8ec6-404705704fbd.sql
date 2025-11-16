-- Update the function to accept pending codes
CREATE OR REPLACE FUNCTION public.activate_premium_with_code(activation_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  code_record RECORD;
  user_profile_id UUID;
BEGIN
  user_profile_id := auth.uid();
  
  IF user_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuário não autenticado');
  END IF;

  -- Get activation code (accept both pending and approved)
  SELECT * INTO code_record
  FROM public.activation_codes
  WHERE code = activation_code
  AND status IN ('pending', 'approved')
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
$function$;

-- Insert test activation code
INSERT INTO public.activation_codes (code, status, expires_at)
VALUES ('121712', 'approved', now() + interval '30 days')
ON CONFLICT DO NOTHING;