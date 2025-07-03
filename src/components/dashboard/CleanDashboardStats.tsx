
import { useClients } from "@/contexts/ClientsContext";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";

export function CleanDashboardStats() {
  const { clients } = useClients();
  const metrics = useBusinessMetrics();

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const eventsThisMonth = clients.filter(client => {
    if (!client.weddingDate) return false;
    const eventDate = new Date(client.weddingDate);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const stats = [
    {
      title: "Contratos Ativos",
      value: metrics.activeContracts,
      subtitle: "no ano atual",
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Receita Garantida",
      value: formatCurrency(metrics.totalRevenue),
      subtitle: "contratos fechados",
      icon: <DollarSign className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Taxa de Conversão",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      subtitle: "leads para contratos",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Eventos do Mês",
      value: eventsThisMonth,
      subtitle: currentMonth,
      icon: <Calendar className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor}`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
