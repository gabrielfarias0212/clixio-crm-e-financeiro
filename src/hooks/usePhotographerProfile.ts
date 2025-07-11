
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
      console.log('Loading photographer profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('photographer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      console.log('Raw profile data from DB:', data);

      if (data) {
        const mappedProfile = {
          company_name: data.company_name || '',
          logo_url: data.avatar_url || '',
          brand_name: data.name || '',
          whatsapp: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          facebook: '',
          instagram: ''
        };
        
        console.log('Mapped profile data:', mappedProfile);
        setProfile(mappedProfile);
      } else {
        console.log('No profile data found');
        setProfile(null);
      }
    } catch (error) {
      console.error('Exception loading profile:', error);
      setProfile(null);
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
