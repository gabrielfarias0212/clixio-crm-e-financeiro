
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PhotographerProfile {
  company_name: string;
  logo_url: string;
  brand_name: string;
  whatsapp: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
}

export function usePhotographerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('photographer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile({
          company_name: data.company_name || '',
          logo_url: data.avatar_url || '',
          brand_name: data.name || '',
          whatsapp: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          facebook: '',
          instagram: ''
        });
      }
    } catch (error) {
      console.error('Exception loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    loadProfile();
  };

  return {
    profile,
    loading,
    refreshProfile
  };
}
