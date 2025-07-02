
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Upload, TrendingUp, Package, Wrench } from "lucide-react";
import { QuickSaleForm } from "@/components/services-products/QuickSaleForm";
import { useQuickSales } from "@/hooks/useQuickSales";
import { useServiceCatalog } from "@/hooks/useServiceCatalog";
import { useProductCatalog } from "@/hooks/useProductCatalog";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QuickSaleFormData } from "@/utils/types";

export default function ServicesProducts() {
  const { quickTransactions, addQuickSale, updatePaymentStatus } = useQuickSales();
  const { services } = useServiceCatalog();
  const { products } = useProductCatalog();

  // Calculate monthly summary
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = quickTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.sale_date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const servicesTotal = monthlyTransactions
    .filter(t => t.transaction_type === 'service')
    .reduce((sum, t) => sum + t.amount, 0);

  const productsTotal = monthlyTransactions
    .filter(t => t.transaction_type === 'product')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRevenue = servicesTotal + productsTotal;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickSale = async (data: QuickSaleFormData): Promise<void> => {
    await addQuickSale(data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Serviços & Produtos
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie vendas rápidas de serviços e produtos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Catálogos
          </Button>
          <QuickSaleForm onSubmit={handleQuickSale} />
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(servicesTotal)}
            </div>
            <p className="text-xs text-gray-500">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(productsTotal)}
            </div>
            <p className="text-xs text-gray-500">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-gray-500">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {monthlyTransactions.length}
            </div>
            <p className="text-xs text-gray-500">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {quickTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">Use o botão "Lançamento Rápido" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quickTransactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.transaction_type === 'service' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {transaction.transaction_type === 'service' ? (
                        <Wrench className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.item_name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.sale_date), "dd/MM/yyyy", { locale: ptBR })}
                        {transaction.client_id && " • Cliente vinculado"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(transaction.amount)}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {transaction.payment_method}
                        {transaction.installments > 1 && ` • ${transaction.installments}x`}
                      </p>
                    </div>
                    <Badge 
                      className={getStatusColor(transaction.payment_status)}
                    >
                      {transaction.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Catalog Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Catálogo de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">{services.length}</p>
              <p className="text-sm text-gray-500">serviços cadastrados</p>
              {services.slice(0, 3).map((service) => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span className="font-medium">{formatCurrency(service.default_price)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Catálogo de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">{products.length}</p>
              <p className="text-sm text-gray-500">produtos cadastrados</p>
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="font-medium">{formatCurrency(product.default_price)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
