import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_display: string;
  font_body: string;
  commission_rate: number;
  subscription_fee: number;
  allow_bargain: boolean;
  allow_cod: boolean;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string | null;
}

const DEFAULT_SETTINGS = {
  site_name: 'MarketHub',
  logo_url: null,
  favicon_url: null,
  primary_color: '32 95% 44%',
  secondary_color: '35 20% 94%',
  accent_color: '15 75% 55%',
  font_display: 'Playfair Display',
  font_body: 'DM Sans',
  commission_rate: 10,
  subscription_fee: 0,
  allow_bargain: true,
  allow_cod: true,
  hero_title: 'Discover Unique Products from Trusted Sellers',
  hero_subtitle: 'A curated marketplace where quality meets authenticity.',
  hero_image: null,
};

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no settings exist, create default row
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('platform_settings')
          .insert(DEFAULT_SETTINGS)
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating default settings:', insertError);
          return null;
        }
        return newData as PlatformSettings;
      }
      
      return data as PlatformSettings;
    }
  });
};

export const useUpdatePlatformSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<PlatformSettings>) => {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!existing) {
        // Create new settings if none exist
        const { error: insertError } = await supabase
          .from('platform_settings')
          .insert({ ...DEFAULT_SETTINGS, ...updates });
        
        if (insertError) throw insertError;
        return;
      }

      const { error } = await supabase
        .from('platform_settings')
        .update(updates)
        .eq('id', existing.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({
        title: 'Settings updated',
        description: 'Platform settings have been saved successfully.'
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive'
      });
    }
  });
};
