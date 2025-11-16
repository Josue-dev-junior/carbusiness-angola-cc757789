import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CHECK-SUBSCRIPTION] Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get the authorization header from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          authorization: authHeader,
        },
      },
    });

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[CHECK-SUBSCRIPTION] Auth error:", userError);
      throw new Error("Authentication error: Auth session missing!");
    }

    console.log("[CHECK-SUBSCRIPTION] User authenticated:", {
      userId: user.id,
      email: user.email,
    });

    // Check the user's premium status in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_premium, premium_expires_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[CHECK-SUBSCRIPTION] Profile error:", profileError);
      throw profileError;
    }

    // Check if premium is still active
    const isPremiumActive =
      profile?.is_premium &&
      profile?.premium_expires_at &&
      new Date(profile.premium_expires_at) > new Date();

    console.log("[CHECK-SUBSCRIPTION] Premium status:", {
      isPremium: profile?.is_premium,
      expiresAt: profile?.premium_expires_at,
      isActive: isPremiumActive,
    });

    return new Response(
      JSON.stringify({
        subscribed: isPremiumActive,
        subscription_end: profile?.premium_expires_at,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[CHECK-SUBSCRIPTION] ERROR in check-subscription -", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
