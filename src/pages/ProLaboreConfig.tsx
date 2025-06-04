
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useProLabore, type CalculationType } from '@/hooks/useProLabore';
import { ArrowLeft, DollarSign, Calendar, Calculator } from 'lucide-react';

export default function ProLaboreConfig() {
  const navigate = useNavigate();
  const { config, saveConfig, loading, calculateNetRevenue } = useProLabore();
  
  const [percentual, setPercentual] = useState<number[]>([30]);
  const [tipoCalculo, setTipoCalculo] = useState<CalculationType>('mensal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Configuração Pró-Labore | Wedding CRM";
    
    if (config) {
      setPercentual([config.percentual]);
      setTipoCalculo(config.tipo_calculo);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveConfig({
        percentual: percentual[0],
        tipo_calculo: tipoCalculo,
        base_calculo: 'receita_liquida'
      });
      
      if (success) {
        navigate('/cash-flow');
      }
    } finally {
      setSaving(false);
    }
  };

  const netRevenue = calculateNetRevenue(tipoCalculo);
  const proLaboreAmount = (netRevenue * percentual[0]) / 100;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando configurações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cash-flow')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Configuração do Pró-Labore</h1>
            <p className="text-muted-foreground">
              Configure como calcular seu pró-labore baseado na receita líquida
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Percentual do Pró-Labore
              </CardTitle>
              <CardDescription>
                Defina qual percentual da receita líquida será destinado ao pró-labore
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Percentual</Label>
                  <span className="text-xl font-bold text-primary">
                    {percentual[0]}%
                  </span>
                </div>
                <Slider
                  value={percentual}
                  onValueChange={setPercentual}
                  min={10}
                  max={40}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10%</span>
                  <span>25%</span>
                  <span>40%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Período de Cálculo
              </CardTitle>
              <CardDescription>
                Escolha se prefere calcular o pró-labore mensalmente ou semanalmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={tipoCalculo}
                onValueChange={(value) => setTipoCalculo(value as CalculationType)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mensal" id="mensal" />
                  <Label htmlFor="mensal" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Mensal</div>
                      <div className="text-sm text-muted-foreground">
                        Cálculo baseado na receita líquida do mês atual
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="semanal" id="semanal" />
                  <Label htmlFor="semanal" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Semanal</div>
                      <div className="text-sm text-muted-foreground">
                        Cálculo baseado na receita líquida da semana atual
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Prévia do Cálculo
              </CardTitle>
              <CardDescription>
                Baseado nas configurações atuais e transações do período
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground">Receita Líquida ({tipoCalculo})</div>
                  <div className="text-xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(netRevenue)}
                  </div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Pró-Labore Disponível</div>
                  <div className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(proLaboreAmount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/cash-flow')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
