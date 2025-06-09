
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductSale } from '@/utils/types';
import { useProductSales } from '@/hooks/useProductSales';
import { useClients } from '@/contexts/ClientsContext';
import { ProductSalesList } from '@/components/ProductSalesList';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductSaleForm } from '@/components/ProductSaleForm';

export default function Products() {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { 
    productSales, 
    isLoading, 
    createProductSale, 
    updateProductSale, 
    deleteProductSale,
    isCreating,
    isUpdating,
    isDeleting
  } = useProductSales();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<ProductSale | null>(null);
  const [viewingSale, setViewingSale] = useState<ProductSale | null>(null);

  const handleCreateSale = (data: Omit<ProductSale, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    createProductSale(data);
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

  const handleEdit = (sale: ProductSale) => {
    setEditingSale(sale);
  };

  const handleView = (sale: ProductSale) => {
    setViewingSale(sale);
  };

  const handleDelete = (id: string) => {
    deleteProductSale(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando vendas de produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendas de Produtos</h1>
          <p className="text-gray-600">Gerencie vendas de álbuns, molduras e outros produtos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Lista de vendas */}
      <ProductSalesList
        productSales={productSales}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isDeleting={isDeleting}
      />

      {/* Dialog para nova venda */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Venda de Produto</DialogTitle>
          </DialogHeader>
          <ProductSaleForm
            onSubmit={handleCreateSale}
            clients={clients}
            isLoading={isCreating}
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
              clients={clients}
              isLoading={isUpdating}
              initialData={editingSale}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar venda */}
      <Dialog open={!!viewingSale} onOpenChange={(open) => !open && setViewingSale(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          {viewingSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Produto</h3>
                  <p>{viewingSale.product_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Tipo</h3>
                  <p className="capitalize">{viewingSale.product_type}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Cliente</h3>
                  <p>{viewingSale.client?.name || 'Venda direta'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Quantidade</h3>
                  <p>{viewingSale.quantity}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Valor Total</h3>
                  <p className="font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(viewingSale.total_amount)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <p className="capitalize">{viewingSale.order_status}</p>
                </div>
              </div>
              
              {viewingSale.description && (
                <div>
                  <h3 className="font-semibold">Descrição</h3>
                  <p>{viewingSale.description}</p>
                </div>
              )}
              
              {viewingSale.notes && (
                <div>
                  <h3 className="font-semibold">Observações</h3>
                  <p>{viewingSale.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
