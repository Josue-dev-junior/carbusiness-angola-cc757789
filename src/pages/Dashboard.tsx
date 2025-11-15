import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Car, Eye, MessageSquare, Crown } from "lucide-react";
import { CarCard } from "@/components/CarCard";
import { PremiumUpgradeCard } from "@/components/PremiumUpgradeCard";
import { PremiumReminderModal } from "@/components/PremiumReminderModal";
import { usePremiumReminder } from "@/hooks/usePremiumReminder";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalCars: number;
  activeCars: number;
  totalViews: number;
  totalMessages: number;
}

interface UserCar {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  location_province: string;
  location_city: string;
  status: string;
  views_count: number;
  car_images: { url: string }[];
}

const Dashboard = () => {
  const { user, loading: authLoading, isPremium, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showReminder, dismissReminder } = usePremiumReminder();
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    activeCars: 0,
    totalViews: 0,
    totalMessages: 0,
  });
  const [userCars, setUserCars] = useState<UserCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('premium') === 'success') {
      toast({
        title: "Upgrade realizado com sucesso!",
        description: "Sua conta Premium foi ativada. Atualizando informações...",
      });
      checkSubscription();
      navigate('/dashboard', { replace: true });
    } else if (urlParams.get('premium') === 'cancelled') {
      toast({
        title: "Upgrade cancelado",
        description: "O processo de upgrade foi cancelado.",
        variant: "destructive",
      });
      navigate('/dashboard', { replace: true });
    }
  }, []);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch user's cars
      const { data: cars, error: carsError } = await supabase
        .from("cars")
        .select(`
          *,
          car_images (url)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (carsError) throw carsError;

      setUserCars(cars || []);

      // Calculate stats
      const totalCars = cars?.length || 0;
      const activeCars = cars?.filter((car) => car.status === "active").length || 0;
      const totalViews = cars?.reduce((sum, car) => sum + (car.views_count || 0), 0) || 0;

      // Fetch messages count
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id);

      setStats({
        totalCars,
        activeCars,
        totalViews,
        totalMessages: messagesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PremiumReminderModal open={showReminder} onOpenChange={dismissReminder} />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                Meu Dashboard
                {isPremium && <Crown className="h-6 w-6 text-primary" />}
              </h1>
              <p className="text-muted-foreground">
                {isPremium ? "Conta Premium ativa" : "Gerencie seus anúncios e visualize estatísticas"}
              </p>
            </div>
            <Link to="/dashboard/create">
              <Button size="lg" className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Criar Anúncio
              </Button>
            </Link>
          </div>

          {!isPremium && (
            <div className="mb-8">
              <PremiumUpgradeCard onUpgrade={checkSubscription} />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total de Anúncios</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCars}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Anúncios Ativos</CardTitle>
                    <Car className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeCars}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalViews}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalMessages}</div>
                  </CardContent>
                </Card>
              </div>

              {/* User's Cars */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Meus Anúncios</h2>
                {userCars.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {userCars.map((car) => (
                      <CarCard
                        key={car.id}
                        id={car.id}
                        title={car.title}
                        brand={car.brand}
                        model={car.model}
                        year={car.year}
                        price={Number(car.price)}
                        mileage={car.mileage}
                        fuelType={car.fuel_type}
                        location={`${car.location_city}, ${car.location_province}`}
                        imageUrl={car.car_images[0]?.url}
                        status={car.status}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="py-12">
                    <CardContent className="text-center">
                      <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não tem anúncios criados.
                      </p>
                      <Link to="/dashboard/create">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Primeiro Anúncio
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
