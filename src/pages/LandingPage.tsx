
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Camera, 
  FileText, 
  Zap, 
  Shield, 
  Heart, 
  CheckCircle 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Gestão de Clientes",
      description: "Controle completo de seus clientes de casamento, desde o primeiro contato até a entrega final."
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "Calendário Integrado",
      description: "Organize todos os eventos, sessões e compromissos em um calendário intuitivo."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-yellow-600" />,
      title: "Controle Financeiro",
      description: "Gerencie receitas, despesas e tenha controle total sobre suas finanças empresariais e pessoais."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Relatórios e Métricas",
      description: "Acompanhe seu desempenho com dashboards completos e relatórios detalhados."
    },
    {
      icon: <Camera className="h-8 w-8 text-pink-600" />,
      title: "Workflow de Produção",
      description: "Controle todo o processo desde a sessão até a entrega das fotos."
    },
    {
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      title: "Documentos e Contratos",
      description: "Organize contratos, propostas e documentos de forma centralizada."
    }
  ];

  const benefits = [
    "Aumente sua produtividade em até 80%",
    "Reduza o tempo gasto em tarefas administrativas",
    "Nunca mais perca um prazo ou compromisso",
    "Tenha controle total sobre suas finanças",
    "Melhore a experiência dos seus clientes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/6b189f38-b0b9-4a2e-8ff2-6635102e14a9.png" 
              alt="GCLIXIO Logo" 
              className="h-auto w-[160px]"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button>Começar Agora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">
            <Zap className="h-4 w-4 mr-2" />
            Sistema Completo de Gestão
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            GCLIXIO
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            O sistema completo para fotógrafos de casamento gerenciarem seus clientes, 
            agenda e finanças de forma profissional e eficiente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-4">
                <Heart className="h-5 w-5 mr-2" />
                Comece Gratuitamente
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              <Shield className="h-5 w-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desenvolvido especialmente para fotógrafos de casamento que querem 
              profissionalizar sua gestão e focar no que realmente importa.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Transforme sua forma de trabalhar
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Junte-se a centenas de fotógrafos que já revolucionaram seus negócios com o GCLIXIO
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e comece a usar o GCLIXIO gratuitamente. 
            Sem compromisso, sem cartão de crédito.
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="text-lg px-12 py-4">
              <Heart className="h-5 w-5 mr-2" />
              Começar Agora Gratuitamente
            </Button>
          </Link>
          
          <p className="text-sm text-gray-500 mt-4">
            Gratuito para sempre • Suporte completo • Sem taxas ocultas
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <img 
            src="/lovable-uploads/6b189f38-b0b9-4a2e-8ff2-6635102e14a9.png" 
            alt="GCLIXIO Logo" 
            className="h-auto w-[120px] mx-auto mb-4 opacity-80"
          />
          <p className="text-gray-400">
            © {new Date().getFullYear()} GCLIXIO. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
