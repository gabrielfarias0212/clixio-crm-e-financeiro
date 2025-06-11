
import { Clock, User, Zap, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ClientStatusHistory } from "@/utils/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientStatusHistoryProps {
  history: ClientStatusHistory[];
  isLoading?: boolean;
}

export function ClientStatusHistory({ history, isLoading }: ClientStatusHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Status
          </CardTitle>
          <CardDescription>
            Acompanhe todas as mudanças de status e ações do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma mudança registrada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'automatic':
        return <Zap className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'automatic':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Status
        </CardTitle>
        <CardDescription>
          Acompanhe todas as mudanças de status e ações do cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((record) => (
            <div key={record.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
              <div className="mt-1">
                <Badge variant="outline" className={getChangeTypeColor(record.changeType)}>
                  <span className="flex items-center gap-1">
                    {getChangeTypeIcon(record.changeType)}
                    {record.changeType === 'automatic' ? 'Auto' : 
                     record.changeType === 'system' ? 'Sistema' : 'Manual'}
                  </span>
                </Badge>
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Status:</span>
                  {record.previousStatus && (
                    <>
                      <span className="text-muted-foreground">{record.previousStatus}</span>
                      <span className="text-muted-foreground">→</span>
                    </>
                  )}
                  <span className="font-medium text-blue-600">{record.newStatus}</span>
                </div>
                
                {(record.previousNextAction || record.newNextAction) && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Ação:</span>
                    {record.previousNextAction && (
                      <>
                        <span className="text-muted-foreground">{record.previousNextAction}</span>
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    <span className="font-medium text-green-600">{record.newNextAction}</span>
                  </div>
                )}
                
                {record.notes && (
                  <p className="text-sm text-muted-foreground">{record.notes}</p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(record.createdAt), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
