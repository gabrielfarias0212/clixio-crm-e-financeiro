
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionChip } from "@/components/ActionChip";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, DollarSign, Users } from "lucide-react";
import { useEffect } from "react";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";

export default function Index() {
  const { clients, loading: clientsLoading } = useClients();
  const { transactions, loading: transactionsLoading } = useTransactions();

  // Stats calculation
  const totalClients = clients.length;
  const totalValue = clients
    .filter(client => client.status === "fechado" || client.status === "em andamento" || client.status === "pago")
    .reduce((sum, client) => sum + client.contractValue, 0);
  
  const pendingActions = clients.filter(
    client => client.nextAction !== "nenhuma"
  ).length;
  
  const completedDeals = clients.filter(
    client => client.status === "fechado" || client.status === "em andamento" || client.status === "pago"
  ).length;

  // Get upcoming weddings (next 90 days)
  const today = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);
  
  const upcomingWeddings = clients
    .filter(client => 
      client.weddingDate && 
      client.weddingDate >= today && 
      client.weddingDate <= ninetyDaysFromNow
    )
    .sort((a, b) => 
      (a.weddingDate as Date).getTime() - (b.weddingDate as Date).getTime()
    )
    .slice(0, 5);

  // Get clients that need attention (need action)
  const clientsNeedingAction = clients
    .filter(client => client.nextAction !== "nenhuma")
    .sort((a, b) => {
      // Sort by status priority
      const statusPriority: Record<string, number> = {
        "em andamento": 1,
        "follow-up": 2,
        "orçamento enviado": 3,
        "fechado": 4,
        "pago": 5
      };

      // Sort by action priority
      const actionPriority: Record<string, number> = {
        "responder": 1,
        "enviar proposta": 2,
        "editar": 3,
        "entregar": 4,
        "nenhuma": 5
      };

      // First by status, then by action
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      return actionPriority[a.nextAction] - actionPriority[b.nextAction];
    })
    .slice(0, 5);

  // Format the currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Format the date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  useEffect(() => {
    document.title = "Dashboard | Wedding CRM";
  }, []);

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h1>
          <Link to="/clients/add">
            <Button>Adicionar Novo Cliente</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="animate-scale-in [animation-delay:100ms]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total de Clientes</p>
                  <h3 className="text-3xl font-bold">{totalClients}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in [animation-delay:200ms]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Contratos Fechados</p>
                  <h3 className="text-3xl font-bold">{completedDeals}</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in [animation-delay:300ms]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Valor Total</p>
                  <h3 className="text-3xl font-bold">{formatCurrency(totalValue)}</h3>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in [animation-delay:400ms]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Ações Pendentes</p>
                  <h3 className="text-3xl font-bold">{pendingActions}</h3>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Weddings */}
          <Card className="animate-slide-in-up [animation-delay:200ms]">
            <CardHeader>
              <CardTitle className="text-lg">Próximos Casamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="text-center py-8">
                  <p>Carregando...</p>
                </div>
              ) : upcomingWeddings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingWeddings.map((client) => (
                    <Link 
                      key={client.id} 
                      to={`/clients/${client.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-gray-500">
                            {client.weddingDate && formatDate(client.weddingDate)}
                          </p>
                        </div>
                        <StatusBadge status={client.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Não há casamentos nos próximos 90 dias
                </div>
              )}
              <div className="mt-4 pt-3 border-t">
                <Link to="/calendar" className="inline-block">
                  <Button variant="link" className="p-0 h-auto">Ver calendário completo</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Actions Needed */}
          <Card className="animate-slide-in-up [animation-delay:300ms]">
            <CardHeader>
              <CardTitle className="text-lg">Ações Necessárias</CardTitle>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="text-center py-8">
                  <p>Carregando...</p>
                </div>
              ) : clientsNeedingAction.length > 0 ? (
                <div className="space-y-4">
                  {clientsNeedingAction.map((client) => (
                    <Link 
                      key={client.id} 
                      to={`/clients/${client.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <ActionChip 
                            action={client.nextAction} 
                            className="mt-1" 
                          />
                        </div>
                        <StatusBadge status={client.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Não há ações pendentes
                </div>
              )}
              <div className="mt-4 pt-3 border-t">
                <Link to="/clients" className="inline-block">
                  <Button variant="link" className="p-0 h-auto">Ver todos os clientes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
