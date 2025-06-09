
import { useState } from 'react';
import { ProductSale, Client } from '@/utils/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Trash2, Package, Search, Filter } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductSalesListProps {
  productSales: ProductSale[];
  onEdit: (productSale: ProductSale) => void;
  onDelete: (id: string) => void;
  onView: (productSale: ProductSale) => void;
  isDeleting?: boolean;
}

export function ProductSalesList({ productSales, onEdit, onDelete, onView, isDeleting }: ProductSalesListProps) {
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  const handleDelete = () => {
    if (saleToDelete) {
      onDelete(saleToDelete);
      setSaleToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pedido: { label: 'Pedido', className: 'bg-blue-100 text-blue-800' },
      producao: { label: 'Em Produção', className: 'bg-yellow-100 text-yellow-800' },
      pronto: { label: 'Pronto', className: 'bg-green-100 text-green-800' },
      entregue: { label: 'Entregue', className: 'bg-gray-100 text-gray-800' },
      cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: '' };
    
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      pendente: { label: 'Pendente', className: 'bg-red-100 text-red-800' },
      parcial: { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800' },
      pago: { label: 'Pago', className: 'bg-green-100 text-green-800' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: '' };
    
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const filteredSales = productSales.filter((sale) => {
    const matchesSearch = sale.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         '';
    
    const matchesStatus = statusFilter === 'all' || sale.order_status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || sale.payment_status === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const totalValue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total de Vendas</p>
                <p className="text-2xl font-bold">{filteredSales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="ml-2">
              <p className="text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="ml-2">
              <p className="text-sm font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredSales.filter(s => s.order_status !== 'entregue' && s.order_status !== 'cancelado').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="ml-2">
              <p className="text-sm font-medium">Entregues</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredSales.filter(s => s.order_status === 'entregue').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Produto ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status do Pedido</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pedido">Pedido</SelectItem>
                  <SelectItem value="producao">Em Produção</SelectItem>
                  <SelectItem value="pronto">Pronto</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status do Pagamento</label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ações</label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentStatusFilter('all');
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 italic">Nenhuma venda de produto encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.product_name}</p>
                          <p className="text-sm text-gray-500">
                            {sale.quantity}x - {sale.product_type}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {sale.client ? (
                          <div>
                            <p className="font-medium">{sale.client.name}</p>
                            <p className="text-sm text-gray-500">{sale.client.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Venda direta</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(sale.total_amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sale.order_status)}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(sale.payment_status)}
                      </TableCell>
                      <TableCell>
                        {sale.delivery_date ? (
                          <span className="text-sm">
                            {format(new Date(sale.delivery_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">Não definida</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(sale)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(sale)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSaleToDelete(sale.id)}
                            title="Excluir"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!saleToDelete} onOpenChange={(open) => !open && setSaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta venda de produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
