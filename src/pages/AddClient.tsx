
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientForm, ClientFormValues } from "@/components/ClientForm";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useClients } from "@/contexts/ClientsContext";

export default function AddClient() {
  const navigate = useNavigate();
  const { addClient } = useClients();

  useEffect(() => {
    document.title = "Adicionar Cliente | Wedding CRM";
  }, []);

  const handleCreateClient = async (data: ClientFormValues) => {
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
      navigate(`/clients/${newClient.id}`);
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
          <h1 className="text-2xl font-bold">Adicionar Cliente</h1>
        </div>
        
        <ClientForm onSubmit={handleCreateClient} />
      </div>
    </Layout>
  );
}
