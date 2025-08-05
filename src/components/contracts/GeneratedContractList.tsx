
import { FileText, Download, Send, CheckCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GeneratedContract } from '@/types/contract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GeneratedContractListProps {
  contracts: GeneratedContract[];
  loading: boolean;
}

const statusConfig = {
  draft: { label: 'Rascunho', icon: Clock, color: 'bg-gray-100 text-gray-800' },
  completed: { label: 'Finalizado', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  sent: { label: 'Enviado', icon: Send, color: 'bg-yellow-100 text-yellow-800' },
  signed: { label: 'Assinado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
};

export function GeneratedContractList({ contracts, loading }: GeneratedContractListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum contrato gerado</h3>
        <p className="mt-1 text-sm text-gray-500">
          Seus contratos gerados aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {contracts.map((contract) => {
        const StatusIcon = statusConfig[contract.status].icon;
        
        return (
          <Card key={contract.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    {contract.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Criado em {format(new Date(contract.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </CardDescription>
                </div>
                <Badge className={statusConfig[contract.status].color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig[contract.status].label}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-600">
                  {contract.client_id && (
                    <div>Cliente: {contract.filled_data.client_name || 'Não informado'}</div>
                  )}
                  <div>Última atualização: {format(new Date(contract.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  
                  {contract.pdf_url && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  )}
                  
                  {contract.status === 'completed' && !contract.pdf_url && (
                    <Button variant="default" size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
