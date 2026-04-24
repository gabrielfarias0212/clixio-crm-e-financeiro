import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageCircle } from "lucide-react";

export function DashboardHeader() {
  const { toast } = useToast();

  const handleWhatsAppIntegration = () => {
    toast({
      title: "Integração em desenvolvimento",
      description: "A integração com WhatsApp Business será implementada em breve.",
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <p className="text-[10px] font-medium tracking-widest uppercase text-stone-400 mb-1">
          Visão geral
        </p>
        <h1 className="text-xl font-medium text-stone-900 leading-tight">
          Dashboard
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Tudo o que você precisa para gerir, crescer e entregar com excelência.
        </p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Link to="/clients/add">
          <Button
            size="sm"
            className="bg-stone-900 hover:bg-stone-700 text-stone-50 text-xs font-medium rounded-lg gap-1.5"
          >
            <Plus size={13} />
            Novo cliente
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="text-xs font-medium rounded-lg border-stone-200 text-stone-600 hover:bg-stone-50 gap-1.5"
          onClick={handleWhatsAppIntegration}
        >
          <MessageCircle size={13} />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
