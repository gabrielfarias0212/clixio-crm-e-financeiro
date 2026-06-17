import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionChip } from "@/components/ActionChip";
import { DeliveredWorkIndicator } from "@/components/DeliveredWorkIndicator";
import { ChevronLeft, Edit } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { Client } from "@/utils/types";
import { DeleteClientDialog } from "@/components/client-detail/DeleteClientDialog";
import { ProjectCosts } from "@/components/client-detail/ProjectCosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientDetails } from "@/components/client-detail/ClientDetails";
import { ClientFormsSection } from "@/components/forms/ClientFormsSection";
import { PortalSettings } from "@/components/client-detail/PortalSettings";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, removeClient } = useClients();
  
  const [client, setClient] = useState<Client | undefined>(
    () => clients.find(c => c.id === id)
  );
  
  useEffect(() => {
    if (!client && clients.length > 0) {
      const foundClient = clients.find(c => c.id === id);
      if (foundClient) {
        setClient(foundClient);
      } else {
        navigate("/clients");
      }
    }
  }, [client, id, clients, navigate]);

  useEffect(() => {
    if (client) {
      document.title = `${client.name} | Wedding CRM`;
    }
  }, [client]);

  const handleDeleteClient = async () => {
    if (!id) return;
    const success = await removeClient(id);
    if (success) {
      navigate("/clients");
    }
  };
  
  const handleClientUpdate = (updatedClient: Client) => {
    setClient(updatedClient);
  };

  if (!client) {
    return (
      <Layout>
        <div className="max-w-screen-lg mx-auto px-4 py-8 text-center">
          Carregando...
        </div>
      </Layout>
    );
  }

  const isDelivered = client.status === "projeto_finalizado";
  
  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <Link 
              to="/clients"
              className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para Clientes
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              {isDelivered && <DeliveredWorkIndicator isDelivered={true} />}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <DeleteClientDialog onDelete={handleDeleteClient} />
            <Link to={`/clients/${client.id}/edit`}>
              <Button size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <StatusBadge status={client.status} />
          <ActionChip action={client.nextAction} />
          <Badge variant="outline" className="border-gray-300">
            {client.eventCategory}
          </Badge>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Informações</TabsTrigger>
            <TabsTrigger value="custos">Custos do Projeto</TabsTrigger>
            <TabsTrigger value="forms">Formulários</TabsTrigger>
            <TabsTrigger value="portal">Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ClientDetails client={client} onUpdate={handleClientUpdate} />
          </TabsContent>

          <TabsContent value="custos">
            <ProjectCosts client={client} />
          </TabsContent>

          <TabsContent value="forms">
            <ClientFormsSection clientId={client.id} />
          </TabsContent>

          <TabsContent value="portal">
            <PortalSettings client={client} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
