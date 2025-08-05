
import { GeneratedContract } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GeneratedContractListProps {
  contracts: GeneratedContract[];
  loading: boolean;
}

export function GeneratedContractList({ contracts, loading }: GeneratedContractListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum contrato gerado</h3>
        <p className="mt-1 text-sm text-gray-500">
          Os contratos que você gerar aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contracts.map((contract) => (
        <Card key={contract.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {contract.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={
                contract.status === 'signed' ? 'default' : 
                contract.status === 'sent' ? 'secondary' : 
                contract.status === 'completed' ? 'outline' : 'secondary'
              }>
                {contract.status === 'draft' ? 'Rascunho' : 
                 contract.status === 'completed' ? 'Concluído' : 
                 contract.status === 'sent' ? 'Enviado' : 'Assinado'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="text-sm text-gray-500">
              <div>Criado em: {format(new Date(contract.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
              <div>Atualizado: {format(new Date(contract.updated_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
