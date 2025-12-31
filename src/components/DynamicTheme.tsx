import { useEffect } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { Helmet } from 'react-helmet-async';

/**
 * Component that applies dynamic platform settings to the document
 * - Updates CSS variables for colors and fonts
 * - Updates meta tags
 * - Updates favicon and title
 */
export const DynamicTheme = () => {
  const { settings, isLoading } = usePlatform();

  useEffect(() => {
    if (isLoading || !settings) return;

    const root = document.documentElement;

    // Apply color variables
    if (settings.primaryColor) {
      root.style.setProperty('--primary', settings.primaryColor);
    }
    if (settings.secondaryColor) {
      root.style.setProperty('--secondary', settings.secondaryColor);
    }
    if (settings.accentColor) {
      root.style.setProperty('--accent', settings.accentColor);
    }

    // Apply font variables
    if (settings.fontDisplay) {
      root.style.setProperty('--font-display', `'${settings.fontDisplay}', serif`);
    }
    if (settings.fontBody) {
      root.style.setProperty('--font-body', `'${settings.fontBody}', sans-serif`);
    }

    // Load Google Fonts dynamically
    if (settings.fontDisplay && settings.fontBody) {
      const fontDisplayEncoded = settings.fontDisplay.replace(/\s+/g, '+');
      const fontBodyEncoded = settings.fontBody.replace(/\s+/g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontDisplayEncoded}:wght@400;500;600;700&family=${fontBodyEncoded}:wght@300;400;500;600;700&display=swap`;
      
      let fontLink = document.querySelector('link[data-dynamic-fonts]') as HTMLLinkElement;
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.setAttribute('data-dynamic-fonts', 'true');
        document.head.appendChild(fontLink);
      }
      fontLink.href = fontUrl;
    }

    // Update favicon
    if (settings.favicon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = settings.favicon;
    }

    // Update title
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }, [settings, isLoading]);

  if (isLoading) return null;

  return (
    <Helmet>
      <title>{settings.siteName || 'MarketHub'}</title>
      <meta name="description" content={settings.metaDescription || 'A production-ready, fully dynamic, multi-vendor e-commerce platform'} />
      {settings.ogImage && <meta property="og:image" content={settings.ogImage} />}
      {settings.twitterHandle && <meta name="twitter:site" content={`@${settings.twitterHandle.replace('@', '')}`} />}
      {settings.twitterHandle && settings.ogImage && <meta name="twitter:image" content={settings.ogImage} />}
    </Helmet>
  );
};

