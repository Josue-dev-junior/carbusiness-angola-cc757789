import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const notifyPaymentSchema = z.object({
  transactionNumber: z.string()
    .trim()
    .min(1, "Número da transação é obrigatório")
    .max(100, "Número da transação muito longo")
    .regex(/^[A-Z0-9\-]+$/i, "Número da transação inválido"),
  proofUrl: z.string()
    .trim()
    .url("URL do comprovativo inválida")
    .max(2048, "URL muito longa")
    .refine((url) => url.startsWith("https://"), "URL deve ser HTTPS"),
  userEmail: z.string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Authenticate the requesting user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Autorização necessária" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validated = notifyPaymentSchema.parse(body);
    const { transactionNumber, proofUrl, userEmail } = validated;

    // Rate limiting: Check for recent requests from this user
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const { data: recentCodes } = await supabaseService
      .from("activation_codes")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 60000).toISOString()); // Last minute
    
    if (recentCodes && recentCodes.length >= 3) {
      return new Response(
        JSON.stringify({ 
          error: "Limite de solicitações excedido. Aguarde um momento antes de tentar novamente." 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate secure activation code using crypto
    const randomBytes = new Uint8Array(6);
    crypto.getRandomValues(randomBytes);
    const code = Array.from(randomBytes)
      .map(byte => byte.toString(36).toUpperCase())
      .join('')
      .substring(0, 6)
      .toUpperCase();
    
    // Store pending activation code with user_id
    const { error: insertError } = await supabaseService
      .from("activation_codes")
      .insert({
        code,
        user_id: user.id,
        transaction_number: transactionNumber,
        payment_proof_url: proofUrl,
        status: "pending",
      });

    if (insertError) {
      console.error("Error creating activation code:", insertError);
      throw insertError;
    }

    // Create WhatsApp message (do NOT include the code)
    const message = `🔔 Nova solicitação de Premium!\n\n` +
      `Email: ${userEmail}\n` +
      `Número da transação: ${transactionNumber}\n` +
      `Comprovativo: ${proofUrl}\n\n` +
      `Por favor, confirme o pagamento e envie o código de ativação ao usuário.`;

    const whatsappNumber = "244922600720";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    console.log(`Payment notification created for user ${user.id}, transaction: ${transactionNumber}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        whatsappUrl,
        message: "Solicitação enviada com sucesso! Aguarde a confirmação do administrador."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notify-payment:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "Dados inválidos",
          details: error.errors.map(e => e.message).join(", ")
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
