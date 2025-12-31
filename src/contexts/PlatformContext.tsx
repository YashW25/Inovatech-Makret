import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlatformSettings } from '@/types/platform';
import { adminApi } from '@/lib/api';

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
  metaDescription: 'A production-ready, fully dynamic, multi-vendor e-commerce platform',
  ogImage: '',
  twitterHandle: '',
};

interface PlatformContextType {
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Try to fetch from public endpoint first
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          // Merge with defaults to ensure all fields exist
          setSettings((prev) => ({ ...defaultSettings, ...data.settings }));
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch platform settings, using defaults:', error);
    }
    setIsLoading(false);
  };

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      // Update via admin API if authenticated
      await adminApi.updateSettings(newSettings);
      setSettings((prev) => ({ ...prev, ...newSettings }));
    } catch (error) {
      // If not authenticated, just update locally
      setSettings((prev) => ({ ...prev, ...newSettings }));
    }
  };

  const refreshSettings = async () => {
    setIsLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <PlatformContext.Provider value={{ settings, updateSettings, isLoading, refreshSettings }}>
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
