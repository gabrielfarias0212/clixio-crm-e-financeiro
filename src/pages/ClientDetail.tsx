
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientPayments } from "@/components/ClientPayments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionChip } from "@/components/ActionChip";
import { DeliveredWorkIndicator } from "@/components/DeliveredWorkIndicator";
import { formatDate } from "@/utils/clientUtils";
import { 
  CalendarIcon, 
  ChevronLeft, 
  DollarSign, 
  Edit, 
  Mail, 
  Phone, 
  Plus,
  Trash2,
  Users
} from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { Client } from "@/utils/types";
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

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, removeClient } = useClients();
  
  const [client, setClient] = useState<Client | undefined>(
    () => clients.find(c => c.id === id)
  );
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
    
    setIsDeleting(true);
    try {
      const success = await removeClient(id);
      if (success) {
        // Direcionar para lista de clientes após excluir
        navigate("/clients");
      }
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
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

  // Formatar para exibição
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const isPaid = client.status === "pago";
  const isFinished = isPaid;
  
  const totalPayments = client.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remainingValue = client.contractValue - totalPayments;
  
  // Formatação da data do casamento
  const weddingDateFormatted = client.weddingDate 
    ? formatDate(client.weddingDate)
    : "Não definida";

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
              {isFinished && <DeliveredWorkIndicator />}
            </div>

            {client.coupleName && (
              <div className="flex items-center gap-1 mt-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{client.coupleName}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados relacionados a este cliente serão excluídos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteClient}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    {isDeleting ? 'Excluindo...' : 'Sim, excluir cliente'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
          <StatusBadge status={client.status} large />
          <ActionChip action={client.nextAction} />
          <Badge variant="outline" className="border-gray-300">
            {client.eventCategory}
          </Badge>
        </div>

        {/* Informações gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Informações de Contato</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{client.email || "Não informado"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{client.phone || "Não informado"}</span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <div>{weddingDateFormatted}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Informações Financeiras</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Valor do Contrato:</span>
                <span className="font-medium">{formatCurrency(client.contractValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Valor Pago:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(totalPayments)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Valor Restante:</span>
                <span className={`font-medium ${remainingValue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(remainingValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Histórico de Pagamentos */}
        <ClientPayments 
          client={client} 
          isPaid={isPaid} 
        />
        
        {/* Notas */}
        {client.notes && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-3">Notas</h2>
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
              {client.notes}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
