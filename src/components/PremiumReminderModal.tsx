import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, X } from "lucide-react";

interface PremiumReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PremiumReminderModal = ({ open, onOpenChange }: PremiumReminderModalProps) => {
  const handleUpgrade = () => {
    window.open('https://wa.me/244922600720?text=Olá, gostaria de fazer upgrade para Premium', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Upgrade para Premium
          </DialogTitle>
          <DialogDescription>
            Desbloqueie recursos exclusivos e impulsione suas vendas!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <p className="text-sm">Contato via WhatsApp entre negociadores</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <p className="text-sm">Assistência técnica com chatbot 24/7</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <p className="text-sm">Selo de verificação azul</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <p className="text-sm">Alcance 5x maior dos anúncios</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <p className="text-sm">Gratificação de 1.000,00kz para +10k seguidores</p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">9.999,00kz/mês</p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpgrade} 
              className="flex-1"
            >
              Fazer Upgrade
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
