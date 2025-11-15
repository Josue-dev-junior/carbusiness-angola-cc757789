import { useEffect } from "react";
import { Car } from "lucide-react";

interface SplashAdProps {
  onComplete: () => void;
}

export const SplashAd = ({ onComplete }: SplashAdProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-fade-in">
      <div className="max-w-2xl mx-auto px-6 text-center space-y-6 animate-scale-in">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Car className="h-24 w-24 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Bem-vindo ao CarBusiness
        </h1>
        
        <p className="text-xl md:text-2xl text-foreground/80 mb-6">
          A plataforma que conecta pessoas para compra e venda de viaturas em Angola
        </p>
        
        <div className="space-y-4 text-foreground/70">
          <p className="text-lg">
            🚗 Compre e venda carros diretamente entre pessoas
          </p>
          <p className="text-lg">
            💼 Negociação segura e transparente
          </p>
          <p className="text-lg">
            🤝 Conecte-se com compradores e vendedores verificados
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
