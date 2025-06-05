
import { useState, useEffect, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionsContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProLaboreConfig, ProLaboreRegistro, CalculationType } from './types';
import { getCurrentPeriodReference } from './utils';
import { calculateNetRevenue, calculateAvailableAmount, calculateWithdrawnAmount } from './calculations';
import {
  fetchProLaboreConfig,
  createOrUpdateProLaboreConfig,
  fetchProLaboreRegistros,
  createProLaboreRegistro,
  deleteProLaboreRegistro
} from './api';

export { CalculationType, ProLaboreConfig, ProLaboreRegistro } from './types';

export const useProLabore = () => {
  const { transactions, refreshTransactions } = useTransactions();
  const [config, setConfig] = useState<ProLaboreConfig | null>(null);
  const [registros, setRegistros] = useState<ProLaboreRegistro[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [configData, registrosData] = await Promise.all([
          fetchProLaboreConfig(),
          fetchProLaboreRegistros()
        ]);
        
        setConfig(configData);
        setRegistros(registrosData);
      } catch (error) {
        console.error('Error loading pro-labore data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate net revenue for current period
  const calcNetRevenue = useCallback((tipo: CalculationType): number => {
    return calculateNetRevenue(transactions, tipo);
  }, [transactions]);

  // Calculate available pro-labore amount
  const calcAvailableAmount = useCallback((): number => {
    if (!config) return 0;
    const netRevenue = calcNetRevenue(config.tipo_calculo);
    return calculateAvailableAmount(config, netRevenue);
  }, [config, calcNetRevenue]);

  // Calculate already withdrawn amount for current period
  const calcWithdrawnAmount = useCallback((): number => {
    return calculateWithdrawnAmount(config, registros);
  }, [config, registros]);

  // Save or update configuration
  const saveConfig = async (newConfig: {
    percentual: number;
    tipo_calculo: CalculationType;
    base_calculo: string;
  }) => {
    try {
      const savedConfig = await createOrUpdateProLaboreConfig(newConfig);
      if (savedConfig) {
        setConfig(savedConfig);
        toast.success('Configuração salva com sucesso!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configuração');
      return false;
    }
  };

  // Register withdrawal
  const registerWithdrawal = async (
    valor: number,
    observacao?: string
  ): Promise<boolean> => {
    if (!config) {
      toast.error('Configure o pró-labore primeiro');
      return false;
    }

    const available = calcAvailableAmount();
    const withdrawn = calcWithdrawnAmount();
    const remaining = available - withdrawn;

    if (valor > remaining) {
      toast.error('Valor excede o limite disponível para retirada');
      return false;
    }

    try {
      const periodo = getCurrentPeriodReference(config.tipo_calculo);
      
      // Create registro
      const registro = await createProLaboreRegistro({
        valor,
        data: new Date().toISOString().split('T')[0],
        observacao,
        tipo_calculo: config.tipo_calculo,
        periodo_referencia: periodo
      });

      if (!registro) {
        toast.error('Erro ao registrar retirada');
        return false;
      }

      // Create transaction in cash flow using the correct table name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('financial_transactions')
          .insert({
            photographer_id: user.id,
            amount: valor,
            date: new Date().toISOString().split('T')[0],
            type: 'saída',
            category: 'Pró-Labore',
            description: `Retirada de pró-labore${observacao ? ` - ${observacao}` : ''}`
          });
      }

      // Refresh data
      const updatedRegistros = await fetchProLaboreRegistros();
      setRegistros(updatedRegistros);
      refreshTransactions();

      toast.success('Retirada registrada com sucesso!');
      return true;
    } catch (error) {
      console.error('Error registering withdrawal:', error);
      toast.error('Erro ao registrar retirada');
      return false;
    }
  };

  // Delete withdrawal
  const deleteWithdrawal = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteProLaboreRegistro(id);
      if (success) {
        const updatedRegistros = await fetchProLaboreRegistros();
        setRegistros(updatedRegistros);
        toast.success('Retirada excluída com sucesso!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting withdrawal:', error);
      toast.error('Erro ao excluir retirada');
      return false;
    }
  };

  return {
    config,
    registros,
    loading,
    calculateNetRevenue: calcNetRevenue,
    calculateAvailableAmount: calcAvailableAmount,
    calculateWithdrawnAmount: calcWithdrawnAmount,
    saveConfig,
    registerWithdrawal,
    deleteWithdrawal
  };
};
