import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PremiumUpgradeCard } from "@/components/PremiumUpgradeCard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const Premium = () => {
  const { isPremium, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Plano Premium</h1>
            <p className="text-muted-foreground mb-8">
              {isPremium 
                ? "Gerencie sua assinatura Premium" 
                : "Desbloqueie recursos exclusivos para impulsionar suas vendas"}
            </p>

            <PremiumUpgradeCard isPremium={isPremium} onUpgrade={checkSubscription} />

            {isPremium && (
              <div className="mt-6">
                <Button 
                  onClick={handleManageSubscription}
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Gerenciar Assinatura"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Premium;
