import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import aboutImage from "@/assets/about-us-image.ico";

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
              Sobre Nós
            </h1>

            {/* Image Section */}
            <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
              <img
                src={aboutImage}
                alt="CarBusiness"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Company Info */}
            <div className="space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4 text-primary">CarBusiness</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A CarBusiness é a plataforma líder em Angola para compra e venda de automóveis, 
                  conectando compradores e vendedores de forma segura e eficiente. Nossa missão é 
                  revolucionar o mercado automóvel angolano, oferecendo uma experiência digital 
                  moderna, transparente e confiável.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                  Com anúncios verificados, suporte local dedicado e uma plataforma intuitiva, 
                  tornamos o processo de compra e venda de carros mais simples e seguro para todos 
                  os angolanos. Acreditamos que cada transação deve ser uma experiência positiva, 
                  construída sobre confiança e transparência.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 text-primary">Nosso CEO</h2>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-2">Josué De Oliveira Mbala</h3>
                  <p className="text-accent font-medium mb-4">Fundador & CEO</p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Empresário angolano visionário, Josué De Oliveira Mbala fundou a CarBusiness 
                    com o objetivo de modernizar o mercado automóvel em Angola. Com uma profunda 
                    compreensão das necessidades locais e uma visão global de inovação tecnológica, 
                    Josué lidera a empresa na construção de soluções que facilitam a vida dos 
                    angolanos interessados em comprar ou vender automóveis.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                    Sob sua liderança, a CarBusiness tornou-se sinônimo de confiança e excelência 
                    no setor automóvel angolano, sempre focada em proporcionar a melhor experiência 
                    possível aos nossos utilizadores.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 text-primary">Nossa Visão</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Ser a plataforma de referência em Angola para transações automóveis, reconhecida 
                  pela segurança, transparência e inovação que oferecemos aos nossos utilizadores.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 text-primary">Nossos Valores</h2>
                <ul className="space-y-3 text-lg text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Confiança:</strong> Construímos relacionamentos baseados em transparência e honestidade</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Inovação:</strong> Buscamos constantemente melhorar e modernizar nossos serviços</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Excelência:</strong> Comprometemo-nos com a qualidade em tudo que fazemos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Compromisso Local:</strong> Entendemos e servimos as necessidades da comunidade angolana</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
