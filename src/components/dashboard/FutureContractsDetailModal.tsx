
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, DollarSign, MapPin, Clock } from "lucide-react";
import { useFutureContracts } from "@/hooks/useFutureContracts";
import { Client } from "@/utils/types";

interface FutureContractsDetailModalProps {
  open: boolean;
  onClose: () => void;
  type: "active" | "nextYear" | "guaranteed" | "projected";
}

export function FutureContractsDetailModal({ open, onClose, type }: FutureContractsDetailModalProps) {
  const { futureContracts, projections } = useFutureContracts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fechado (aguardando assinatura)':
        return 'bg-green-100 text-green-800';
      case 'evento principal fotografado':
        return 'bg-blue-100 text-blue-800';
      case 'contrato oficializado e entrada confirmada':
        return 'bg-emerald-100 text-emerald-800';
      case 'todas as entregas finalizadas':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredContracts = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    switch (type) {
      case "active":
        return futureContracts;
      case "nextYear":
        return futureContracts.filter(client => {
          if (!client.weddingDate) return false;
          return new Date(client.weddingDate).getFullYear() === nextYear;
        });
      case "guaranteed":
        return futureContracts.filter(client => 
          client.status === 'fechado (aguardando assinatura)' || client.status === 'contrato oficializado e entrada confirmada'
        );
      case "projected":
        return futureContracts.filter(client => 
          client.status === 'evento principal fotografado' || client.status === 'proposta enviada'
        );
      default:
        return [];
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case "active":
        return "Contratos Ativos - Detalhes";
      case "nextYear":
        return "Contratos do Próximo Ano";
      case "guaranteed":
        return "Receita Garantida - Contratos Fechados/Pagos";
      case "projected":
        return "Receita Projetada - Contratos em Andamento";
      default:
        return "Detalhes dos Contratos";
    }
  };

  const contracts = getFilteredContracts();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[500px]">
          {contracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data do Evento</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categoria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {client.weddingDate ? formatDate(client.weddingDate) : 'Não definida'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.eventLocation || 'Não informado'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(client.contractValue)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{client.eventCategory}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum contrato encontrado para esta categoria.</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total de contratos:</span>
              <span className="ml-2 font-medium">{contracts.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Valor total:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(contracts.reduce((sum, c) => sum + c.contractValue, 0))}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
