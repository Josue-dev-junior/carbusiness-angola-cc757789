import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Gauge, Calendar, Fuel, BadgeCheck } from "lucide-react";

interface CarCardProps {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  location: string;
  imageUrl?: string;
  status?: string;
  sellerName?: string;
  sellerIsVerified?: boolean;
}

export const CarCard = ({
  id,
  title,
  brand,
  model,
  year,
  price,
  mileage,
  fuelType,
  location,
  imageUrl,
  status = "active",
  sellerName,
  sellerIsVerified = false,
}: CarCardProps) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatMileage = (value: number) => {
    return new Intl.NumberFormat("pt-AO").format(value) + " km";
  };

  return (
    <Link to={`/cars/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        {/* Image */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-muted-foreground text-sm">Sem imagem</span>
            </div>
          )}
          {status !== "active" && (
            <Badge className="absolute top-2 right-2 bg-secondary">
              {status === "sold" ? "Vendido" : "Pendente"}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 mb-3">
            <p className="text-sm text-muted-foreground">
              {brand} {model}
            </p>
            {sellerIsVerified && sellerName && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>•</span>
                <span>{sellerName}</span>
                <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-500" />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-primary mb-3">
            {formatPrice(price)}
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              <span>{formatMileage(mileage)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              <span className="capitalize">{fuelType}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
