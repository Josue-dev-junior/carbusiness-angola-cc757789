import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userEmail, fileUrl, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Check if user uploaded payment proof (fileUrl provided)
    if (fileUrl && userId) {
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Generate 6-digit activation code
      const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Store activation code in database
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

      const { error: insertError } = await supabase
        .from('activation_codes')
        .insert({
          code: activationCode,
          user_id: userId,
          payment_proof_url: fileUrl,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        });

      if (insertError) {
        console.error('Error storing activation code:', insertError);
        throw new Error('Failed to store activation code');
      }

      const codeMessage = `✅ Comprovativo recebido com sucesso!

Seu código de ativação Premium: ${activationCode}

⚠️ IMPORTANTE: Não partilhe seu código secreto com mais ninguém, caso isso aconteça a sua conta será desativada e você perderá o acesso à conta.

Deseja ativar seu plano Premium agora?
[SHOW_ACTIVATION_BUTTON]`;

      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: codeMessage
          }
        }]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é um assistente profissional de pagamento da CarBusiness.

INSTRUÇÕES IMPORTANTES:
1. Cumprimente o usuário de forma profissional
2. Explique o processo de pagamento completo:
   - Conta Express: 922600720
   - Valor: 9.999,00 Kz/mês
3. Solicite que o usuário envie:
   - Comprovativo de transferência em PDF (use o botão "Enviar Comprovativo")
   - Número da transação (digite no campo de mensagem)
4. Após receber o comprovativo, você irá gerar automaticamente um código de ativação de 6 dígitos
5. O usuário deve usar esse código para liberar o acesso Premium

Seja profissional, claro e educado. Não invente informações.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in premium-chatbot:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
