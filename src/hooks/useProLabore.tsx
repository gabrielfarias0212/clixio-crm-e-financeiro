
import { useState, useEffect, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionsContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CalculationType = 'mensal' | 'semanal';

export interface ProLaboreConfig {
  id: string;
  user_id: string;
  percentual: number;
  tipo_calculo: CalculationType;
  base_calculo: string;
  created_at: string;
  updated_at: string;
}

export interface ProLaboreRegistro {
  id: string;
  user_id: string;
  valor: number;
  data: string;
  observacao?: string;
  tipo_calculo: CalculationType;
  periodo_referencia: string;
  created_at: string;
}

// Utility functions
const getCurrentPeriodReference = (tipo: CalculationType): string => {
  const now = new Date();
  if (tipo === 'mensal') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } else {
    const weekNumber = getWeekNumber(now);
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  }
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// API functions
const fetchProLaboreConfig = async (): Promise<ProLaboreConfig | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('pro_labore_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching pro-labore config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching pro-labore config:', error);
    return null;
  }
};

const createOrUpdateProLaboreConfig = async (config: {
  percentual: number;
  tipo_calculo: CalculationType;
  base_calculo: string;
}): Promise<ProLaboreConfig | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('pro_labore_config')
      .upsert({
        user_id: user.id,
        percentual: config.percentual,
        tipo_calculo: config.tipo_calculo,
        base_calculo: config.base_calculo,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating pro-labore config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception creating/updating pro-labore config:', error);
    return null;
  }
};

const fetchProLaboreRegistros = async (
  startDate?: string,
  endDate?: string
): Promise<ProLaboreRegistro[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('pro_labore_registros')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });

    if (startDate) {
      query = query.gte('data', startDate);
    }
    if (endDate) {
      query = query.lte('data', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching pro-labore registros:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching pro-labore registros:', error);
    return [];
  }
};

const createProLaboreRegistro = async (registro: {
  valor: number;
  data: string;
  observacao?: string;
  tipo_calculo: CalculationType;
  periodo_referencia: string;
}): Promise<ProLaboreRegistro | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('pro_labore_registros')
      .insert({
        user_id: user.id,
        valor: registro.valor,
        data: registro.data,
        observacao: registro.observacao,
        tipo_calculo: registro.tipo_calculo,
        periodo_referencia: registro.periodo_referencia
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pro-labore registro:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception creating pro-labore registro:', error);
    return null;
  }
};

const deleteProLaboreRegistro = async (id: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('pro_labore_registros')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting pro-labore registro:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting pro-labore registro:', error);
    return false;
  }
};

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
  const calculateNetRevenue = useCallback((tipo: CalculationType): number => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (tipo === 'mensal') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      // Weekly calculation
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const periodTransactions = transactions.filter(t => 
      t.date >= startDateStr && t.date <= endDateStr
    );

    const receitas = periodTransactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);

    const despesas = periodTransactions
      .filter(t => t.type === 'saída')
      .reduce((sum, t) => sum + t.amount, 0);

    return receitas - despesas;
  }, [transactions]);

  // Calculate available pro-labore amount
  const calculateAvailableAmount = useCallback((): number => {
    if (!config) return 0;

    const netRevenue = calculateNetRevenue(config.tipo_calculo);
    const proLaboreAmount = (netRevenue * config.percentual) / 100;
    
    return Math.max(0, proLaboreAmount);
  }, [config, calculateNetRevenue]);

  // Calculate already withdrawn amount for current period
  const calculateWithdrawnAmount = useCallback((): number => {
    if (!config) return 0;

    const currentPeriod = getCurrentPeriodReference(config.tipo_calculo);
    return registros
      .filter(r => r.periodo_referencia === currentPeriod)
      .reduce((sum, r) => sum + r.valor, 0);
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

    const available = calculateAvailableAmount();
    const withdrawn = calculateWithdrawnAmount();
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
    calculateNetRevenue,
    calculateAvailableAmount,
    calculateWithdrawnAmount,
    saveConfig,
    registerWithdrawal,
    deleteWithdrawal
  };
};
