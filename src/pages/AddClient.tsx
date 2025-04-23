
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientForm, ClientFormValues } from "@/components/ClientForm";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useClients } from "@/contexts/ClientsContext";
import { Button } from "@/components/ui/button";
import { clearAllData } from "@/utils/supabaseUtils";

export default function AddClient() {
  const navigate = useNavigate();
  const { addClient } = useClients();
  const [submitting, setSubmitting] = useState(false);
  const [clearingData, setClearingData] = useState(false);

  useEffect(() => {
    document.title = "Adicionar Cliente | Wedding CRM";
  }, []);

  const handleClearData = async () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      setClearingData(true);
      try {
        const success = await clearAllData();
        if (success) {
          toast.success("Todos os dados foram excluídos com sucesso");
          setTimeout(() => {
            window.location.href = "/clients";
          }, 1500);
        } else {
          toast.error("Erro ao limpar dados");
        }
      } catch (error) {
        console.error("Error clearing data:", error);
        toast.error("Erro ao limpar dados");
      } finally {
        setClearingData(false);
      }
    }
  };

  const handleCreateClient = async (data: ClientFormValues) => {
    setSubmitting(true);
    try {
      console.info("Creating client:", data);
      
      const newClient = await addClient({
        name: data.name,
        email: data.email,
        phone: data.phone,
        weddingDate: data.weddingDate,
        contractValue: data.contractValue,
        downPayment: data.downPayment,
        status: data.status,
        nextAction: data.nextAction,
        notes: data.notes || "",
      });
      
      if (newClient) {
        toast.success("Cliente adicionado com sucesso!");
        navigate(`/clients/${newClient.id}`);
      } else {
        toast.error("Erro ao adicionar cliente. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Erro ao adicionar cliente. Por favor, tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/clients"
            className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Clientes
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">Adicionar Cliente</h1>
            <Button 
              variant="destructive" 
              onClick={handleClearData}
              disabled={clearingData}
            >
              {clearingData ? "Limpando..." : "Limpar Todos os Dados"}
            </Button>
          </div>
        </div>
        
        <ClientForm 
          onSubmit={handleCreateClient} 
          isSubmitting={submitting}
        />
      </div>
    </Layout>
  );
}
