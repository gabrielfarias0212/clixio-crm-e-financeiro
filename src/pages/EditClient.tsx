
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientForm, ClientFormValues } from "@/components/ClientForm";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Client } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";

export default function EditClient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient } = useClients();
  const [client, setClient] = useState<Client | undefined>(
    () => clients.find(c => c.id === id)
  );

  useEffect(() => {
    if (!client && clients.length > 0) {
      const foundClient = clients.find(c => c.id === id);
      setClient(foundClient);
    }
  }, [client, id, clients]);

  useEffect(() => {
    if (!client && clients.length > 0 && !clients.find(c => c.id === id)) {
      toast.error("Cliente não encontrado");
      navigate("/clients");
      return;
    }
    
    if (client) {
      document.title = `Editar ${client.name} | Wedding CRM`;
    }
  }, [client, navigate, id, clients]);

  const handleUpdateClient = async (data: ClientFormValues) => {
    if (!client || !id) return;
    
    console.log("Updating client with data:", data); // Log the data being sent
    console.log("Event Category being updated:", data.eventCategory); // Add specific log for event category
    
    const updatedClient = await updateClient(id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      weddingDate: data.weddingDate,
      contractValue: data.contractValue,
      downPayment: data.downPayment,
      status: data.status,
      nextAction: data.nextAction,
      notes: data.notes || "",
      eventCategory: data.eventCategory || "outro", // Ensure eventCategory is included in the update
    });
    
    if (updatedClient) {
      toast.success("Cliente atualizado com sucesso!");
      navigate(`/clients/${id}`);
    }
  };

  if (!client) return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8 text-center">
        Carregando...
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to={`/clients/${id}`}
            className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para o Cliente
          </Link>
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
        </div>
        
        <ClientForm client={client} onSubmit={handleUpdateClient} />
      </div>
    </Layout>
  );
}
