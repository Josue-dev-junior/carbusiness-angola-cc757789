import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

export const AdminCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCars = async () => {
    const { data, error } = await supabase
      .from("cars")
      .select(`
        *,
        profiles:user_id (name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCars(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleApprove = async (carId: string) => {
    const { error } = await supabase
      .from("cars")
      .update({ status: "active" })
      .eq("id", carId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o anúncio",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Anúncio aprovado com sucesso",
      });
      fetchCars();
    }
  };

  const handleReject = async (carId: string) => {
    const { error } = await supabase
      .from("cars")
      .update({ status: "rejected" })
      .eq("id", carId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o anúncio",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Anúncio rejeitado",
      });
      fetchCars();
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Anúncios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{car.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {car.brand} {car.model} - {car.year}
                </p>
                <p className="text-sm text-muted-foreground">
                  Anunciante: {car.profiles.name}
                </p>
                <p className="text-sm font-medium">
                  {car.price.toLocaleString("pt-AO")} Kz
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    car.status === "active"
                      ? "default"
                      : car.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {car.status === "active"
                    ? "Ativo"
                    : car.status === "pending"
                    ? "Pendente"
                    : "Rejeitado"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/car/${car.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {car.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(car.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(car.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
