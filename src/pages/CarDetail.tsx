import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, MapPin, Fuel, Calendar, Gauge, MessageCircle, Heart, User, BadgeCheck } from "lucide-react";

interface Car {
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
  description: string;
  has_mixero: boolean;
  mixero_commission: number | null;
  user_id: string;
  profiles: {
    name: string;
    phone: string | null;
    avatar_url: string | null;
    is_premium: boolean;
    verified: boolean;
  };
}

interface CarImage {
  url: string;
  display_order: number;
}

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [images, setImages] = useState<CarImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchCarDetails();
    if (user) {
      checkFavorite();
    }
  }, [id, user]);

  const fetchCarDetails = async () => {
    try {
      const { data: carData, error: carError } = await supabase
        .from("cars")
        .select(`
          *,
          profiles (name, phone, avatar_url, is_premium, verified)
        `)
        .eq("id", id)
        .single();

      if (carError) throw carError;

      const { data: imagesData, error: imagesError } = await supabase
        .from("car_images")
        .select("url, display_order")
        .eq("car_id", id)
        .order("display_order");

      if (imagesError) throw imagesError;

      setCar(carData);
      setImages(imagesData || []);
    } catch (error) {
      console.error("Error fetching car:", error);
      toast.error("Erro ao carregar detalhes do carro");
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("car_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Faça login para adicionar favoritos");
      navigate("/auth");
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("car_id", id)
          .eq("user_id", user.id);
        toast.success("Removido dos favoritos");
      } else {
        await supabase
          .from("favorites")
          .insert({ car_id: id, user_id: user.id });
        toast.success("Adicionado aos favoritos");
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Erro ao atualizar favoritos");
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      toast.error("Faça login para contactar o vendedor");
      navigate("/auth");
      return;
    }

    if (user.id === car?.user_id) {
      toast.error("Não pode contactar o seu próprio anúncio");
      return;
    }

    navigate(`/messages?car=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Carro não encontrado</h2>
            <Button onClick={() => navigate("/cars")}>Ver outros carros</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.url}
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Sem imagens</p>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-video rounded overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${car.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold">{car.title}</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{car.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm">{car.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Fuel className="h-4 w-4" />
                      <span className="text-sm">{car.fuel_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{car.location_city}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{car.description}</p>
                  </div>

                  {car.has_mixero && (
                    <div className="border-t pt-4">
                      <Badge variant="secondary" className="mb-2">
                        Com Mixero
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Comissão do Mixero: {car.mixero_commission}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Preço</p>
                    <p className="text-3xl font-bold text-primary">
                      {car.price.toLocaleString()} Kz
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={handleContactSeller}
                      className="w-full"
                      size="lg"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Contactar Vendedor
                    </Button>

                    <Button
                      onClick={toggleFavorite}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Heart className={`mr-2 h-5 w-5 ${isFavorite ? "fill-current text-destructive" : ""}`} />
                      {isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold">Vendedor</h3>
                  <Link to={`/profile/${car.user_id}`} className="block hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={car.profiles.avatar_url} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{car.profiles.name}</p>
                          {car.profiles.verified && (
                            <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-500" />
                          )}
                        </div>
                        {car.profiles.phone && (
                          <p className="text-sm text-muted-foreground">{car.profiles.phone}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{car.location_province}, {car.location_city}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CarDetail;
