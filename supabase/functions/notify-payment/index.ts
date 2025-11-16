import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactionNumber, proofUrl, userEmail } = await req.json();

    // Create WhatsApp message
    const message = `🔔 Nova solicitação de Premium!\n\n` +
      `Email: ${userEmail}\n` +
      `Número da transação: ${transactionNumber}\n` +
      `Comprovativo: ${proofUrl}\n\n` +
      `Por favor, confirme o pagamento respondendo a esta mensagem.`;

    const whatsappNumber = "244922600720";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Store pending activation code
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error: insertError } = await supabaseClient
      .from("activation_codes")
      .insert({
        code,
        transaction_number: transactionNumber,
        payment_proof_url: proofUrl,
        status: "pending",
      });

    if (insertError) {
      console.error("Error creating activation code:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        whatsappUrl,
        code,
        message: "Informações enviadas com sucesso!"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notify-payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
