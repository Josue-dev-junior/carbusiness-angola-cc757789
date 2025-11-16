import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";

interface PremiumUpgradeCardProps {
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export const PremiumUpgradeCard = ({ isPremium = false, onUpgrade }: PremiumUpgradeCardProps) => {
  const benefits = [
    "Contato via WhatsApp entre negociadores",
    "Assistência técnica com chatbot 24/7",
    "Selo de verificação azul",
    "Alcance 5x maior dos anúncios",
    "Gratificação de 1.000,00kz para +10k seguidores"
  ];

  const handleUpgrade = () => {
    window.open('https://wa.me/244922600720?text=Olá, gostaria de fazer upgrade para Premium', '_blank');
  };

  return (
    <>
      {isPremium ? (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Conta Premium
              </CardTitle>
              <Badge className="bg-primary">Ativa</Badge>
            </div>
            <CardDescription>
              Você tem acesso a todas as ferramentas profissionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Upgrade para Premium
              </CardTitle>
              <Badge variant="outline">9.999,00kz/mês</Badge>
            </div>
            <CardDescription>
              Acesse ferramentas avançadas para vender suas viaturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button 
              onClick={handleUpgrade} 
              className="w-full"
            >
              Fazer Upgrade Agora
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};
