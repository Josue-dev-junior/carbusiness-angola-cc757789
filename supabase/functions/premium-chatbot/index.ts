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
    const { messages, userEmail } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `Você é um assistente de suporte para o CarBusiness, uma plataforma de compra e venda de carros em Angola.
    
Sua função é ajudar usuários com dúvidas sobre o site, incluindo:

1. Como criar e gerenciar anúncios de carros
2. Como pesquisar e filtrar carros disponíveis
3. Como entrar em contato com vendedores
4. Como configurar e editar o perfil
5. Como funciona o sistema de mensagens
6. Informações sobre os planos (Gratuito e Premium)
7. Como usar as diferentes funcionalidades do site

Benefícios do Plano Premium:
- Contato via WhatsApp entre negociadores
- Assistência técnica com chatbot 24/7
- Selo de verificação azul
- Alcance 5x maior dos anúncios
- Gratificação de 1.000,00kz para +10k seguidores
- Preço: 9.999,00kz/mês

Se o usuário quiser fazer upgrade para Premium, informe que deve clicar no botão "Fazer Upgrade" que o redirecionará para o WhatsApp do suporte: +244922600720

Seja profissional, prestativo e claro em suas respostas. Foque em ajudar o usuário a usar o site da melhor forma possível.`;

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
