-- Modificar a função para permitir que o mesmo código seja usado múltiplas vezes
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

  -- Get activation code (allow reusable codes)
  SELECT * INTO code_record
  FROM public.activation_codes
  WHERE code = activation_code
  AND status = 'approved'
  AND expires_at > now();

  IF code_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou expirado');
  END IF;

  -- Check if user is already premium
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_profile_id 
    AND is_premium = true 
    AND premium_expires_at > now()
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Você já possui uma assinatura Premium ativa');
  END IF;

  -- Update user to premium
  UPDATE public.profiles
  SET 
    is_premium = true,
    premium_expires_at = now() + interval '30 days',
    updated_at = now()
  WHERE id = user_profile_id;

  RETURN jsonb_build_object('success', true, 'message', 'Premium ativado com sucesso');
END;
$function$;

-- Reset the code to approved status
UPDATE activation_codes 
SET status = 'approved', user_id = NULL, activated_at = NULL 
WHERE code = '121712';