import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!title || !message) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let userIds: string[] = [];

      if (targetType === "all") {
        const { data } = await supabase.from("profiles").select("id");
        userIds = data?.map((u) => u.id) || [];
      } else if (targetType === "premium") {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("is_premium", true);
        userIds = data?.map((u) => u.id) || [];
      } else if (targetType === "regular") {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("is_premium", false);
        userIds = data?.map((u) => u.id) || [];
      }

      const notifications = userIds.map((userId) => ({
        user_id: userId,
        title,
        message,
        type: "admin",
      }));

      const { error } = await supabase.from("notifications").insert(notifications);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Aviso enviado para ${userIds.length} usuário(s)`,
      });

      setTitle("");
      setMessage("");
      setTargetType("all");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o aviso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emitir Avisos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Destinatários</label>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              <SelectItem value="premium">Apenas Premium</SelectItem>
              <SelectItem value="regular">Apenas Regulares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do aviso"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mensagem</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mensagem do aviso"
            rows={5}
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSendNotification}
          disabled={isLoading}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {isLoading ? "Enviando..." : "Enviar Aviso"}
        </Button>
      </CardContent>
    </Card>
  );
};
