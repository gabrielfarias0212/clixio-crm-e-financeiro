
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientForm, ClientFormValues } from "@/components/ClientForm";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { clients } from "@/utils/mockData";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { Payment } from "@/utils/types";

export default function AddClient() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Adicionar Cliente | Wedding CRM";
  }, []);

  const handleCreateClient = (data: ClientFormValues) => {
    console.info("Creating client:", data);
    
    // Create an initial payment if a downpayment is specified and status is not initial
    const payments: Payment[] = [];
    if (data.downPayment > 0 && data.status !== "orçamento enviado" && data.status !== "follow-up") {
      payments.push({
        id: uuidv4(),
        amount: data.downPayment,
        date: new Date(),
        notes: "Entrada inicial"
      });
    }
    
    // Create a new client object
    const newClient = {
      id: uuidv4(),
      ...data,
      payments,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Add to the clients array (in a real app, this would be an API call)
    clients.unshift(newClient);
    
    toast.success("Cliente adicionado com sucesso!");
    navigate(`/clients/${newClient.id}`);
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
