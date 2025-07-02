
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Zap, Plus } from "lucide-react";
import { QuickSaleFormData } from "@/utils/types";
import { useServiceCatalog } from "@/hooks/useServiceCatalog";
import { useProductCatalog } from "@/hooks/useProductCatalog";
import { useClients } from "@/contexts/ClientsContext";
import { formatCurrency } from "@/utils/currency";

interface QuickSaleFormProps {
  onSubmit: (data: QuickSaleFormData) => Promise<void>;
}

export function QuickSaleForm({ onSubmit }: QuickSaleFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<QuickSaleFormData>({
    type: 'service',
    amount: 0,
    saleDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'pix',
    installments: 1
  });

  const { services } = useServiceCatalog();
  const { products } = useProductCatalog();
  const { clients } = useClients();

  const selectedCatalogItems = formData.type === 'service' ? services : products;
  const selectedItem = selectedCatalogItems.find(item => item.id === formData.catalogItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount < 0) {
      return;
    }

    if (!formData.catalogItemId && !formData.customName?.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        type: 'service',
        amount: 0,
        saleDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'pix',
        installments: 1
      });
      setOpen(false);
    } catch (error) {
      console.error('Error submitting quick sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCatalogItemChange = (itemId: string) => {
    const item = selectedCatalogItems.find(i => i.id === itemId);
    setFormData(prev => ({
      ...prev,
      catalogItemId: itemId,
      amount: item?.default_price || 0,
      customName: undefined
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Lançamento Rápido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Lançamento Rápido
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: 'service' | 'product') => 
                setFormData(prev => ({ ...prev, type: value, catalogItemId: undefined, amount: 0 }))
              }
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="service" id="service" />
                <Label htmlFor="service">Serviço</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="product" id="product" />
                <Label htmlFor="product">Produto</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Item do Catálogo</Label>
            <Select onValueChange={handleCatalogItemChange} value={formData.catalogItemId || ""}>
              <SelectTrigger>
                <SelectValue placeholder={`Selecionar ${formData.type === 'service' ? 'serviço' : 'produto'}`} />
              </SelectTrigger>
              <SelectContent>
                {selectedCatalogItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {formatCurrency(item.default_price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!formData.catalogItemId && (
            <div>
              <Label htmlFor="customName">Nome Personalizado *</Label>
              <Input
                id="customName"
                value={formData.customName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, customName: e.target.value }))}
                placeholder={`Nome do ${formData.type === 'service' ? 'serviço' : 'produto'}`}
                required={!formData.catalogItemId}
              />
            </div>
          )}

          <div>
            <Label>Cliente (Opcional)</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="saleDate">Data</Label>
              <Input
                id="saleDate"
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Método de Pagamento</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="parcelado">Parcelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.paymentMethod === 'parcelado' && (
            <div>
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="2"
                max="12"
                value={formData.installments}
                onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) || 1 }))}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.installments > 1 && `${formData.installments}x de ${formatCurrency(formData.amount / formData.installments)}`}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
