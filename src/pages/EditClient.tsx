
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientForm, ClientFormValues } from "@/components/ClientForm";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Client, ClientStatus, NextAction, EventCategory } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";

export default function EditClient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient } = useClients();
  const [client, setClient] = useState<Client | undefined>(
    () => clients.find(c => c.id === id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    console.log("Updating client with data:", data);
    setIsSubmitting(true);
    
    try {
      // Use the string dates directly
      const updatedClient = await updateClient(id, {
        name: data.name,
        coupleName: data.coupleName,
        email: data.email,
        phone: data.phone,
        weddingDate: data.weddingDate,
        weddingStartTime: data.weddingStartTime,
        weddingEndTime: data.weddingEndTime,
        contractValue: data.contractValue,
        downPayment: data.downPayment,
        status: data.status as ClientStatus,
        nextAction: data.nextAction as NextAction,
        eventCategory: data.eventCategory as EventCategory,
        eventLocation: data.eventLocation,
        preWeddingDate: data.preWeddingDate,
        preWeddingStartTime: data.preWeddingStartTime,
        preWeddingEndTime: data.preWeddingEndTime,
        contractLink: data.contractLink,
        hasPreWedding: data.hasPreWedding,
        notes: data.notes || "",
      });
      
      if (updatedClient) {
        toast.success("Cliente atualizado com sucesso!");
        navigate(`/clients/${id}`);
      } else {
        toast.error("Erro ao atualizar cliente");
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
    } finally {
      setIsSubmitting(false);
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
        
        <ClientForm 
          client={client} 
          onSubmit={handleUpdateClient} 
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
}
