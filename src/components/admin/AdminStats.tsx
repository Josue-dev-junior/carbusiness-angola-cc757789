import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Car, Clock, CheckCircle } from "lucide-react";

export const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    pendingCars: 0,
    activeCars: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, carsRes, pendingRes, activeRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("cars").select("id", { count: "exact", head: true }),
        supabase.from("cars").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("cars").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalCars: carsRes.count || 0,
        pendingCars: pendingRes.count || 0,
        activeCars: activeRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Anúncios</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCars}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anúncios Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingCars}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anúncios Ativos</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCars}</div>
        </CardContent>
      </Card>
    </div>
  );
};
