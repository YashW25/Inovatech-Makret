import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlatformSettings } from '@/types/platform';
import { supabase } from '@/integrations/supabase/client';

const defaultSettings: PlatformSettings = {
  siteName: 'MarketHub',
  logo: '',
  favicon: '',
  primaryColor: '32 95% 44%',
  secondaryColor: '35 20% 94%',
  accentColor: '15 75% 55%',
  fontDisplay: 'Playfair Display',
  fontBody: 'DM Sans',
  commissionRate: 10,
  subscriptionFee: 0,
  allowBargain: true,
  allowCOD: true,
  heroTitle: 'Discover Unique Products from Trusted Sellers',
  heroSubtitle: 'A curated marketplace where quality meets authenticity. Shop directly from verified vendors worldwide.',
  heroImage: '',
};

interface PlatformContextType {
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching platform settings:', error);
        return;
      }

      if (data) {
        setSettings({
          siteName: data.site_name || defaultSettings.siteName,
          logo: data.logo_url || defaultSettings.logo,
          favicon: data.favicon_url || defaultSettings.favicon,
          primaryColor: data.primary_color || defaultSettings.primaryColor,
          secondaryColor: data.secondary_color || defaultSettings.secondaryColor,
          accentColor: data.accent_color || defaultSettings.accentColor,
          fontDisplay: data.font_display || defaultSettings.fontDisplay,
          fontBody: data.font_body || defaultSettings.fontBody,
          commissionRate: data.commission_rate ?? defaultSettings.commissionRate,
          subscriptionFee: data.subscription_fee ?? defaultSettings.subscriptionFee,
          allowBargain: data.allow_bargain ?? defaultSettings.allowBargain,
          allowCOD: data.allow_cod ?? defaultSettings.allowCOD,
          heroTitle: data.hero_title || defaultSettings.heroTitle,
          heroSubtitle: data.hero_subtitle || defaultSettings.heroSubtitle,
          heroImage: data.hero_image || defaultSettings.heroImage,
        });
      }
    } catch (err) {
      console.error('Failed to load platform settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const refetch = async () => {
    setIsLoading(true);
    await fetchSettings();
  };

  return (
    <PlatformContext.Provider value={{ settings, updateSettings, isLoading, refetch }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
