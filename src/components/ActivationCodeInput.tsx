import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

interface ActivationCodeInputProps {
  onSuccess: () => void;
}

export const ActivationCodeInput = ({ onSuccess }: ActivationCodeInputProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleActivate = async () => {
    if (code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("activate_premium_with_code", {
        activation_code: code.toUpperCase(),
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (result.success) {
        toast({
          title: "Premium Ativado!",
          description: "Sua conta Premium foi ativada com sucesso.",
        });
        onSuccess();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Código inválido ou expirado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error activating code:", error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Ativar Premium
        </CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos que você recebeu após a confirmação do pagamento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Digite o código (ex: ABC123)"
          maxLength={6}
          className="text-center text-lg tracking-wider"
        />
        <Button
          onClick={handleActivate}
          disabled={isLoading || code.length !== 6}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ativando...
            </>
          ) : (
            "Ativar Premium"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
