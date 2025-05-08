import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
export function DashboardHeader() {
  const {
    toast
  } = useToast();

  // Function for future WhatsApp integration notification
  const handleWhatsAppIntegration = () => {
    toast({
      title: "Integração em desenvolvimento",
      description: "A integração com WhatsApp Business será implementada em breve.",
      duration: 3000
    });
  };
  return <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Tudo o que você precisa para gerir, crescer e entregar com excelência.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Link to="/clients/add">
            <Button className="text-sm font-bold text-stone-50 bg-green-700 hover:bg-green-600 w-full sm:w-auto">
              Adicionar Novo Cliente
            </Button>
          </Link>
          <Button variant="outline" className="text-sm w-full sm:w-auto" onClick={handleWhatsAppIntegration}>
            Integrar WhatsApp
          </Button>
        </div>
      </div>
    </div>;
}