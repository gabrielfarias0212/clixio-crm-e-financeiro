
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { Client } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Calendar, Phone, Mail, CreditCard, FileText } from "lucide-react";
import { formatDate } from "@/utils/clientUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionChip } from "@/components/ActionChip";
import { ClientPayments } from "@/components/ClientPayments";
import { DeliveredWorkIndicator } from "@/components/DeliveredWorkIndicator";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, updateClient: updateClientData, refreshClients } = useClients();
  const [client, setClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Find the client with the matching ID
    if (id && clients) {
      const foundClient = clients.find(c => c.id === id);
      setClient(foundClient || null);
    }
  }, [id, clients]);

  useEffect(() => {
    // Set page title
    document.title = client ? `${client.name} | Wedding CRM` : "Cliente | Wedding CRM";
  }, [client]);

  // Handle back button click
  const handleBack = () => {
    navigate("/clients");
  };

  // Update the handleMarkAsDelivered function to set sessionStorage
  const handleMarkAsDelivered = async () => {
    if (!client || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const updatedClient = await updateClientData(client.id, {
        status: "pago",
        nextAction: "nenhuma"
      });
      
      if (updatedClient) {
        toast.success("Trabalho marcado como entregue com sucesso!");
        // Set flag in sessionStorage to show alert on clients list page
        sessionStorage.setItem('hasDeliveredWork', 'true');
        refreshClients();
      } else {
        toast.error("Erro ao marcar trabalho como entregue");
      }
    } catch (error) {
      toast.error("Erro ao atualizar o status do cliente");
      console.error("Error marking work as delivered:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the client is not found or not loaded yet
  if (!client) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-semibold mb-4">Cliente não encontrado</h2>
          <Button onClick={handleBack}>Voltar para a lista de clientes</Button>
        </div>
      </Layout>
    );
  }

  const isDelivered = client.status === "pago";
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <Button variant="outline" onClick={handleBack} className="mb-4">
              Voltar para clientes
            </Button>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={client.status} />
              {client.nextAction !== "nenhuma" && <ActionChip action={client.nextAction} />}
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button 
              variant={isDelivered ? "outline" : "default"}
              className={isDelivered ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : ""}
              onClick={handleMarkAsDelivered}
              disabled={isSubmitting || isDelivered}
            >
              {isDelivered ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Trabalho Entregue
                </>
              ) : (
                "Marcar como entregue"
              )}
            </Button>
            <Button onClick={() => navigate(`/clients/edit/${client.id}`)}>
              Editar Cliente
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="relative mb-6">
              <DeliveredWorkIndicator isDelivered={isDelivered} />
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  {/* Contact information */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{client.phone || "Não informado"}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{client.email || "Não informado"}</span>
                    </div>
                  </div>
                  
                  {/* Event information */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {client.weddingDate 
                          ? formatDate(new Date(client.weddingDate)) 
                          : "Data não definida"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(client.contractValue)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                {client.notes && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-start mb-2">
                      <FileText className="h-4 w-4 mr-2 text-gray-500 mt-1" />
                      <h3 className="font-medium">Observações</h3>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Client Timeline or Activities section could go here */}
          </div>
          
          <div>
            <ClientPayments client={client} onPaymentAdded={refreshClients} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
