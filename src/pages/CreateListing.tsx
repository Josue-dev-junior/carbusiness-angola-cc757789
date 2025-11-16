import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { ImageUploader } from "@/components/ImageUploader";

const carSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(100),
  brand: z.string().min(2, "Marca obrigatória"),
  model: z.string().min(2, "Modelo obrigatório"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(1, "Preço deve ser maior que 0"),
  mileage: z.number().int("Quilometragem deve ser um número inteiro").min(0, "Quilometragem inválida"),
  fuel_type: z.string().min(1, "Tipo de combustível obrigatório"),
  location_province: z.string().min(1, "Província obrigatória"),
  location_city: z.string().min(1, "Cidade obrigatória"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres").max(1000),
  has_mixero: z.boolean(),
  mixero_commission: z.number().min(0).max(100).optional(),
});

const CreateListing = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    mileage: "",
    fuel_type: "",
    location_province: "",
    location_city: "",
    description: "",
    has_mixero: false,
    mixero_commission: "",
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const provinces = [
    "Luanda", "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
    "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
    "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe",
    "Uíge", "Zaire"
  ];

  const fuelTypes = ["Gasolina", "Diesel", "Híbrido", "Elétrico", "GNV"];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (imageUrls.length === 0) {
        toast.error("Adicione pelo menos uma imagem do carro");
        setIsSubmitting(false);
        return;
      }

      // Validate form data
      const validated = carSchema.parse({
        ...formData,
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Math.round(Number(formData.mileage)),
        has_mixero: formData.has_mixero,
        mixero_commission: formData.has_mixero && formData.mixero_commission 
          ? Number(formData.mixero_commission) 
          : undefined,
      });

      // Insert car
      const { data: car, error: carError } = await supabase
        .from("cars")
        .insert([{
          user_id: user.id,
          title: validated.title,
          brand: validated.brand,
          model: validated.model,
          year: validated.year,
          price: validated.price,
          mileage: validated.mileage,
          fuel_type: validated.fuel_type,
          location_province: validated.location_province,
          location_city: validated.location_city,
          description: validated.description,
          has_mixero: validated.has_mixero,
          mixero_commission: validated.mixero_commission,
          status: 'pending' // Anúncio aguardando aprovação administrativa
        }])
        .select()
        .single();

      if (carError) throw carError;

      // Insert images
      const imageInserts = imageUrls.map((url, index) => ({
        car_id: car.id,
        url: url,
        display_order: index,
      }));

      const { error: imagesError } = await supabase
        .from("car_images")
        .insert(imageInserts);

      if (imagesError) throw imagesError;

      toast.success(
        "Anúncio criado com sucesso! Aguarde a aprovação da equipe de moderação.",
        { duration: 5000 }
      );
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        // Scroll to first error field
        setTimeout(() => {
          const firstErrorField = Object.keys(fieldErrors)[0];
          const element = document.getElementById(firstErrorField);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }, 100);
        
        const errorCount = Object.keys(fieldErrors).length;
        toast.error(
          `Corrija ${errorCount} ${errorCount === 1 ? 'erro' : 'erros'} no formulário`,
          { duration: 5000 }
        );
      } else {
        console.error("Error creating listing:", error);
        toast.error("Erro ao criar anúncio");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Criar Novo Anúncio</CardTitle>
              <CardDescription>
                Preencha as informações do seu carro para criar um anúncio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Anúncio</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: Toyota Corolla 2020 em excelente estado"
                    value={formData.title}
                    onChange={handleChange}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Brand & Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      name="brand"
                      placeholder="Ex: Toyota"
                      value={formData.brand}
                      onChange={handleChange}
                      className={errors.brand ? "border-destructive" : ""}
                    />
                    {errors.brand && (
                      <p className="text-sm text-destructive">{errors.brand}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      name="model"
                      placeholder="Ex: Corolla"
                      value={formData.model}
                      onChange={handleChange}
                      className={errors.model ? "border-destructive" : ""}
                    />
                    {errors.model && (
                      <p className="text-sm text-destructive">{errors.model}</p>
                    )}
                  </div>
                </div>

                {/* Year & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      placeholder="2020"
                      value={formData.year}
                      onChange={handleChange}
                      className={errors.year ? "border-destructive" : ""}
                    />
                    {errors.year && (
                      <p className="text-sm text-destructive">{errors.year}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (AOA)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="5000000"
                      value={formData.price}
                      onChange={handleChange}
                      className={errors.price ? "border-destructive" : ""}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price}</p>
                    )}
                  </div>
                </div>

                {/* Mileage & Fuel Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Quilometragem (km)</Label>
                    <Input
                      id="mileage"
                      name="mileage"
                      type="number"
                      step="1"
                      placeholder="50000"
                      value={formData.mileage}
                      onChange={handleChange}
                      className={errors.mileage ? "border-destructive" : ""}
                    />
                    {errors.mileage && (
                      <p className="text-sm text-destructive">{errors.mileage}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuel_type">Combustível</Label>
                    <Select
                      value={formData.fuel_type}
                      onValueChange={(value) => handleSelectChange("fuel_type", value)}
                    >
                      <SelectTrigger className={errors.fuel_type ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione o combustível" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fuel_type && (
                      <p className="text-sm text-destructive">{errors.fuel_type}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location_province">Província</Label>
                    <Select
                      value={formData.location_province}
                      onValueChange={(value) => handleSelectChange("location_province", value)}
                    >
                      <SelectTrigger className={errors.location_province ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione a província" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location_province && (
                      <p className="text-sm text-destructive">{errors.location_province}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location_city">Cidade</Label>
                    <Input
                      id="location_city"
                      name="location_city"
                      placeholder="Ex: Luanda"
                      value={formData.location_city}
                      onChange={handleChange}
                      className={errors.location_city ? "border-destructive" : ""}
                    />
                    {errors.location_city && (
                      <p className="text-sm text-destructive">{errors.location_city}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva as características e condições do carro... (mínimo 20 caracteres)"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description}</p>
                      )}
                    </div>
                    <p className={`text-xs ${formData.description.length >= 20 ? 'text-muted-foreground' : 'text-destructive'}`}>
                      {formData.description.length}/20 caracteres
                    </p>
                  </div>
                </div>

                {/* Mixero Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has_mixero"
                      checked={formData.has_mixero}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          has_mixero: e.target.checked,
                          mixero_commission: e.target.checked ? formData.mixero_commission : ""
                        });
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="has_mixero" className="font-semibold">
                      Este anúncio tem Mixero (Corretor)?
                    </Label>
                  </div>

                  {formData.has_mixero && (
                    <div className="space-y-2">
                      <Label htmlFor="mixero_commission">Comissão do Mixero (%)</Label>
                      <Input
                        id="mixero_commission"
                        name="mixero_commission"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Ex: 5"
                        value={formData.mixero_commission}
                        onChange={handleChange}
                        className={errors.mixero_commission ? "border-destructive" : ""}
                      />
                      {errors.mixero_commission && (
                        <p className="text-sm text-destructive">{errors.mixero_commission}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Percentagem que o mixero receberá pela venda (0-100%)
                      </p>
                    </div>
                  )}
                </div>

                {/* Images Upload */}
                <div className="space-y-2">
                  <Label>Imagens do Carro *</Label>
                  <ImageUploader 
                    onImagesChange={setImageUrls}
                    maxImages={10}
                  />
                  <p className="text-sm text-muted-foreground">
                    Adicione até 10 imagens. A primeira será a imagem principal.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Anúncio"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateListing;
