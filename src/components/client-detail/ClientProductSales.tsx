
import { useState } from 'react';
import { ProductSale, Client } from '@/utils/types';
import { useProductSales } from '@/hooks/useProductSales';
import { ProductSaleForm } from '@/components/ProductSaleForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

interface ClientProductSalesProps {
  client: Client;
}

export function ClientProductSales({ client }: ClientProductSalesProps) {
  const { 
    productSales, 
    createProductSale, 
    updateProductSale, 
    deleteProductSale,
    isCreating,
    isUpdating,
    isDeleting
  } = useProductSales();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<ProductSale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);

  // Filtrar vendas do cliente atual
  const clientProductSales = productSales.filter(sale => sale.client_id === client.id);

  const handleCreateSale = (data: Omit<ProductSale, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    createProductSale({
      ...data,
      client_id: client.id
    });
    setIsFormOpen(false);
  };

  const handleUpdateSale = (data: Omit<ProductSale, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (editingSale) {
      updateProductSale({ 
        id: editingSale.id, 
        updates: data 
      });
      setEditingSale(null);
    }
  };

  const handleDelete = () => {
    if (saleToDelete) {
      deleteProductSale(saleToDelete);
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

  const totalValue = clientProductSales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos Vendidos
          </CardTitle>
          {clientProductSales.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {clientProductSales.length} {clientProductSales.length === 1 ? 'produto' : 'produtos'} • 
              Total: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalValue)}
            </p>
          )}
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Vender Produto
        </Button>
      </CardHeader>
      
      <CardContent>
        {clientProductSales.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 italic">Nenhum produto vendido para este cliente</p>
            <Button 
              variant="outline" 
              onClick={() => setIsFormOpen(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Vender Primeiro Produto
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientProductSales.map((sale) => (
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
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingSale(sale)}
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

      {/* Dialog para nova venda */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vender Produto para {client.name}</DialogTitle>
          </DialogHeader>
          <ProductSaleForm
            onSubmit={handleCreateSale}
            clients={[client]}
            isLoading={isCreating}
            initialData={{ client_id: client.id }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar venda */}
      <Dialog open={!!editingSale} onOpenChange={(open) => !open && setEditingSale(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Venda de Produto</DialogTitle>
          </DialogHeader>
          {editingSale && (
            <ProductSaleForm
              onSubmit={handleUpdateSale}
              clients={[client]}
              isLoading={isUpdating}
              initialData={editingSale}
            />
          )}
        </DialogContent>
      </Dialog>

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
    </Card>
  );
}
