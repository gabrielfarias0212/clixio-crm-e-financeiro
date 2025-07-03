
import { useAlerts } from "@/hooks/useAlerts";
import { Client } from "@/utils/types";
import { AlertCircle, Edit3, Package2, DollarSign, CalendarHeart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface CleanAlertsSectionProps {
  clients: Client[];
}

export function CleanAlertsSection({ clients }: CleanAlertsSectionProps) {
  const alerts = useAlerts(clients);
  const navigate = useNavigate();

  const totalAlerts = alerts.editTasks.length + alerts.deliverTasks.length + alerts.payments.length + alerts.preWedding.length;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'edit': return <Edit3 className="h-4 w-4" />;
      case 'deliver': return <Package2 className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'pre_wedding': return <CalendarHeart className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleAlertClick = (alert: any) => {
    if (alert.client) {
      navigate(`/clients/${alert.client.id}`);
    }
  };

  const allAlerts = [
    ...alerts.editTasks.map(alert => ({ ...alert, type: 'edit' })),
    ...alerts.deliverTasks.map(alert => ({ ...alert, type: 'deliver' })),
    ...alerts.payments.map(alert => ({ ...alert, type: 'payment' })),
    ...alerts.preWedding.map(alert => ({ ...alert, type: 'pre_wedding' }))
  ].sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Alertas e Lembretes</h2>
              <p className="text-sm text-gray-500">Itens que precisam de atenção</p>
            </div>
          </div>
          {totalAlerts > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {totalAlerts}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6">
        {allAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-500">Nenhum alerta pendente!</p>
            <p className="text-sm text-gray-400 mt-1">Tudo em ordem por aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAlerts.slice(0, 8).map((alert, index) => (
              <div
                key={`${alert.type}-${index}`}
                onClick={() => handleAlertClick(alert)}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getUrgencyColor(alert.urgency)}`}>
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{alert.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                </div>
                <Badge 
                  variant={alert.urgency === 'high' ? 'destructive' : alert.urgency === 'medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {alert.urgency === 'high' ? 'Alta' : alert.urgency === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
            ))}
            {allAlerts.length > 8 && (
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  E mais {allAlerts.length - 8} {allAlerts.length - 8 === 1 ? 'alerta' : 'alertas'}...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
