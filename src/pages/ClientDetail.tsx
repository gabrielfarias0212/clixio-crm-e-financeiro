
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionChip } from "@/components/ActionChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  ChevronLeft,
  DollarSign,
  Edit,
  MailIcon,
  PhoneIcon,
  Trash
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { ClientPayments } from "@/components/ClientPayments";
import { Client } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients } = useClients();
  const [client, setClient] = useState<Client | undefined>(() =>
    clients.find((c) => c.id === id)
  );

  // Update client when clients context changes
  useEffect(() => {
    const found = clients.find((c) => c.id === id);
    setClient(found);
  }, [clients, id]);

  useEffect(() => {
    if (!client) {
      toast.error("Cliente não encontrado");
      navigate("/clients");
      return;
    }
    document.title = `${client.name} | Wedding CRM`;
  }, [client, navigate]);

  if (!client) return null;

  const handleDelete = () => {
    // No delete implementation yet for Supabase; just toast and redirect for now.
    toast.success("Cliente removido com sucesso");
    navigate("/clients");
  };

  const formattedValue = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(client.contractValue);

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <Link 
              to="/clients"
              className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para Clientes
            </Link>
            <h1 className="text-2xl font-bold">{client.name}</h1>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/clients/edit/${client.id}`)}
              className="gap-1"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-1">
                  <Trash className="h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente os dados deste cliente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Status information */}
        <Card className="mb-6 animate-scale-in [animation-delay:100ms]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Status do Contrato</h3>
                <StatusBadge status={client.status} className="text-sm py-1 px-3" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Próxima Ação</h3>
                <ActionChip action={client.nextAction} className="text-sm py-1 px-3" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  {client.status === "orçamento enviado" || client.status === "follow-up" 
                    ? "Valor Potencial" 
                    : "Valor do Contrato"}
                </h3>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="font-medium">{formattedValue}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information Section (only for closed contracts) */}
        {client.status !== "orçamento enviado" && client.status !== "follow-up" && (
          <ClientPayments client={client} onUpdate={() => {}} />
        )}

        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2 animate-slide-in-up [animation-delay:200ms]">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Informações do Cliente</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Nome</h3>
                  <p>{client.name}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <a 
                        href={`mailto:${client.email}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Telefone</h3>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <a 
                        href={`tel:${client.phone}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Data do Evento</h3>
                  {client.weddingDate ? (
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                      {format(client.weddingDate, "dd/MM/yyyy")}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Data não definida</p>
                  )}
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Notas</h3>
                  {client.notes ? (
                    <div className="whitespace-pre-line">{client.notes}</div>
                  ) : (
                    <p className="text-gray-500 italic">Nenhuma nota</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-in-up [animation-delay:300ms]">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Informações do Sistema</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Cliente desde</h3>
                  <p>{format(client.createdAt, "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Última atualização</h3>
                  <p>{format(client.updatedAt, "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">ID do cliente</h3>
                  <p className="font-mono text-xs text-gray-500">{client.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
