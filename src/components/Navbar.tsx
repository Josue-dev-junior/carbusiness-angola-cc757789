import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-foreground">CarBusiness</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/cars"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/cars") ? "text-primary" : "text-foreground/80"
              }`}
            >
              Ver Carros
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/dashboard") ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  Meu Dashboard
                </Link>
                <Link
                  to="/messages"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/messages") ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  Mensagens
                </Link>
                <Link to="/dashboard/create">
                  <Button variant="default" size="sm">
                    Anunciar Carro
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="default" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                to="/cars"
                className="text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ver Carros
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meu Dashboard
                  </Link>
                  <Link
                    to="/messages"
                    className="text-sm font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mensagens
                  </Link>
                  <Link to="/dashboard/create" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" size="sm" className="w-full">
                      Anunciar Carro
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" size="sm" className="w-full">
                      Cadastrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
