
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Save } from 'lucide-react';
import { useCashFlowData } from '@/hooks/useCashFlowData';
import { toast } from 'sonner';

export function FinancialSettings() {
  const { financialSettings, updateFinancialSettings } = useCashFlowData();
  const [isOpen, setIsOpen] = useState(false);
  const [prolaborePercentage, setProlaborePercentage] = useState(
    financialSettings?.prolabore_percentage || 30
  );
  const [monthlyGoal, setMonthlyGoal] = useState(
    financialSettings?.monthly_goal || 50000
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFinancialSettings({
        prolabore_percentage: prolaborePercentage,
        monthly_goal: monthlyGoal
      });
      toast.success('Configurações salvas com sucesso!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurações Financeiras
          </span>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações Financeiras</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="prolabore">Percentual de Pró-labore (%)</Label>
                  <Input
                    id="prolabore"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={prolaborePercentage}
                    onChange={(e) => setProlaborePercentage(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual das entradas mensais destinado ao pró-labore
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal">Meta Mensal (R$)</Label>
                  <Input
                    id="goal"
                    type="number"
                    min="0"
                    step="100"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor da meta de faturamento mensal
                  </p>
                </div>
                
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Pró-labore:</span>
            <span className="text-sm text-blue-600 font-bold">
              {financialSettings?.prolabore_percentage || 30}%
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Meta Mensal:</span>
            <span className="text-sm text-green-600 font-bold">
              {formatCurrency(financialSettings?.monthly_goal || 50000)}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Configure os percentuais e metas para um melhor controle financeiro
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
