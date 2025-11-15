import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Shield, MessageCircle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PremiumUpgradeCard } from "@/components/PremiumUpgradeCard";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/70" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary-foreground mb-6">
              CarBusiness — Compra e Venda de Carros em Angola
            </h1>
            <p className="text-xl text-secondary-foreground/90 mb-8">
              Encontre o carro ideal ou venda com segurança e facilidade. Anúncios verificados e suporte local.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cars">
                <Button size="lg" className="w-full sm:w-auto group">
                  Ver Carros
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-background/10 backdrop-blur border-secondary-foreground/20 text-secondary-foreground hover:bg-background/20">
                  Anunciar meu Carro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Três passos simples para comprar ou vender o seu carro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Publique</h3>
                <p className="text-muted-foreground">
                  Crie um anúncio em minutos com fotos e descrição detalhada do seu carro.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Conecte</h3>
                <p className="text-muted-foreground">
                  Receba mensagens diretas de compradores interessados no seu anúncio.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Negocie</h3>
                <p className="text-muted-foreground">
                  Feche negócio com segurança e deixe sua avaliação após a transação.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <PremiumUpgradeCard />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de angolanos que já compram e vendem carros com segurança no CarBusiness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cars">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Explorar Carros
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-primary-foreground/10 backdrop-blur border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
