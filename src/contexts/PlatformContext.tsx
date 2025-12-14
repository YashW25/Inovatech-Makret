import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlatformSettings } from '@/types/platform';

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
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <PlatformContext.Provider value={{ settings, updateSettings }}>
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
