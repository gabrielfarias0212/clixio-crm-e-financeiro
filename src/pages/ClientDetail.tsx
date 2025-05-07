
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientPayments } from "@/components/ClientPayments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionChip } from "@/components/ActionChip";
import { DeliveredWorkIndicator } from "@/components/DeliveredWorkIndicator";
import { ChevronLeft, Edit } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { Client } from "@/utils/types";
import { ClientInfo } from "@/components/client-detail/ClientInfo";
import { FinancialInfo } from "@/components/client-detail/FinancialInfo";
import { DeleteClientDialog } from "@/components/client-detail/DeleteClientDialog";
import { ClientNotes } from "@/components/client-detail/ClientNotes";

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
        // Cliente não encontrado, redirecione para a lista
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
      // Direcionar para lista de clientes após excluir
      navigate("/clients");
    }
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

  const isPaid = client.status === "pago";
  const isFinished = isPaid;
  
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
              {isFinished && <DeliveredWorkIndicator isDelivered={true} />}
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
        
        {/* Status e Ação */}
        <div className="flex flex-wrap gap-2 mb-6">
          <StatusBadge status={client.status} />
          <ActionChip action={client.nextAction} />
          <Badge variant="outline" className="border-gray-300">
            {client.eventCategory}
          </Badge>
        </div>

        {/* Informações gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ClientInfo client={client} />
          <FinancialInfo client={client} />
        </div>
        
        {/* Histórico de Pagamentos */}
        <ClientPayments client={client} />
        
        {/* Notas */}
        <ClientNotes notes={client.notes} />
      </div>
    </Layout>
  );
}
