import { Link } from "react-router-dom";
import { Car, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Car className="h-6 w-6 text-accent" />
              <span>CarBusiness</span>
            </Link>
            <p className="text-sm opacity-90 max-w-md">
              Compra e venda de carros em Angola. Anúncios verificados e suporte local para uma experiência segura e confiável.
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="font-semibold mb-4">Links Úteis</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/cars" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">
                Ver Carros
              </Link>
              <Link to="/about" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">
                Sobre Nós
              </Link>
              <Link to="/auth" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">
                Entrar
              </Link>
              <Link to="/auth?mode=signup" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">
                Cadastrar
              </Link>
              <Link to="/admin/login" className="opacity-70 hover:opacity-100 hover:text-accent transition-colors text-xs mt-2">
                Acesso Admin
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href="mailto:Softecsuport@gmail.com"
                className="flex items-center gap-2 opacity-90 hover:opacity-100 hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                Softecsuport@gmail.com
              </a>
              <div className="flex items-center gap-2 opacity-90">
                <MapPin className="h-4 w-4" />
                Viana, Luanda, Angola
              </div>
              <Button 
                size="sm" 
                className="mt-2 w-full"
                asChild
              >
                <a href="mailto:Softecsuport@gmail.com?subject=Patrocínio CarBusiness">
                  Seja Patrocinador
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm opacity-90">
          <p>© 2025 CarBusiness — Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
