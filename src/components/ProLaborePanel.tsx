
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useProLabore } from '@/hooks/useProLabore';
import { 
  DollarSign, 
  Plus, 
  Settings, 
  TrendingUp, 
  Calendar,
  Trash2,
  AlertCircle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ProLaborePanel = () => {
  const navigate = useNavigate();
  const {
    config,
    registros,
    loading,
    calculateAvailableAmount,
    calculateWithdrawnAmount,
    getDebugInfo,
    registerWithdrawal,
    deleteWithdrawal
  } = useProLabore();

  const [open, setOpen] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!config) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Meu Pró-Labore
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Configurar Pró-Labore</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração Necessária
                </CardTitle>
                <CardDescription>
                  Configure seu pró-labore para começar a usar esta funcionalidade
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={() => {
                    setOpen(false);
                    navigate('/prolabore-config');
                  }}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configurar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  const available = calculateAvailableAmount();
  const withdrawn = calculateWithdrawnAmount();
  const remaining = available - withdrawn;
  const progressPercentage = available > 0 ? (withdrawn / available) * 100 : 0;
  const debugInfo = getDebugInfo();

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    if (amount > remaining) {
      toast.error('Valor excede o limite disponível');
      return;
    }

    setSubmitting(true);
    try {
      const success = await registerWithdrawal(amount, withdrawalNote);
      if (success) {
        setWithdrawalAmount('');
        setWithdrawalNote('');
        setShowWithdrawalForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteWithdrawal(id);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Meu Pró-Labore
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <div>
            <DrawerTitle>Pró-Labore</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Período {config.tipo_calculo} • {config.percentual}% da receita líquida
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setOpen(false);
                navigate('/prolabore-config');
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Debug Info */}
          {showDebugInfo && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm">Informações de Debug</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>Período atual: <strong>{debugInfo.currentPeriod}</strong></div>
                <div>Total de transações: <strong>{debugInfo.totalTransactions}</strong></div>
                <div>Transações do período: <strong>{debugInfo.periodTransactions}</strong></div>
                <div>Receita líquida: <strong>{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(debugInfo.netRevenue)}</strong></div>
                <div>Percentual: <strong>{debugInfo.percentage}%</strong></div>
                <div>Tipo de cálculo: <strong>{debugInfo.calculationType}</strong></div>
              </CardContent>
            </Card>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Disponível</div>
                <div className="text-lg font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(available)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Retirado</div>
                <div className="text-lg font-bold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(withdrawn)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Restante</div>
                <div className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(remaining)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning se não há transações */}
          {debugInfo.periodTransactions === 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Não há transações no período {config.tipo_calculo} atual. 
                  O valor disponível será R$ 0,00.
                </span>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilizado</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          {!showWithdrawalForm ? (
            <Button 
              onClick={() => setShowWithdrawalForm(true)}
              disabled={remaining <= 0}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Registrar Retirada
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nova Retirada</CardTitle>
                <CardDescription>
                  Limite disponível: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(remaining)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0,00"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    max={remaining}
                  />
                </div>
                <div>
                  <Label htmlFor="note">Observação (opcional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Descrição da retirada..."
                    value={withdrawalNote}
                    onChange={(e) => setWithdrawalNote(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowWithdrawalForm(false);
                      setWithdrawalAmount('');
                      setWithdrawalNote('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleWithdrawal}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Registrando...' : 'Registrar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Histórico de Retiradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registros.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma retirada registrada ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {registros.slice(0, 10).map((registro) => (
                    <div
                      key={registro.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(registro.valor)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {registro.tipo_calculo}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {format(new Date(registro.data), "dd/MM/yyyy", { locale: ptBR })}
                          {registro.observacao && ` • ${registro.observacao}`}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta retirada? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(registro.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
