
import { supabase } from '@/integrations/supabase/client';
import { ProLaboreConfig, ProLaboreRegistro, CalculationType } from './types';

export const fetchProLaboreConfig = async (): Promise<ProLaboreConfig | null> => {
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

export const createOrUpdateProLaboreConfig = async (config: {
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

export const fetchProLaboreRegistros = async (
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

export const createProLaboreRegistro = async (registro: {
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

export const deleteProLaboreRegistro = async (id: string): Promise<boolean> => {
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
