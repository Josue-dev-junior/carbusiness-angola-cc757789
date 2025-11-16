import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  is_premium: boolean;
  verified: boolean;
  created_at: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ verified: !currentStatus })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de verificação",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: currentStatus
          ? "Verificação removida com sucesso"
          : "Usuário verificado com sucesso",
      });
      fetchUsers();
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{user.name}</h3>
                  {user.verified && (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex gap-2 mt-1">
                  {user.is_premium && <Badge>Premium</Badge>}
                  {user.verified && <Badge variant="outline">Verificado</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.verified ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVerification(user.id, true)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover Verificação
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleToggleVerification(user.id, false)}
                  >
                    <BadgeCheck className="h-4 w-4 mr-1" />
                    Verificar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
