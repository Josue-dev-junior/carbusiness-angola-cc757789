import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PremiumUpgradeCard } from "@/components/PremiumUpgradeCard";
import { ActivationCodeInput } from "@/components/ActivationCodeInput";
import { useAuth } from "@/hooks/useAuth";

const Premium = () => {
  const { isPremium, checkSubscription } = useAuth();

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

            {!isPremium && (
              <div className="mt-6">
                <ActivationCodeInput onSuccess={checkSubscription} />
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
