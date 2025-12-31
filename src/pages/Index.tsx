import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SellerCTA from '@/components/home/SellerCTA';
import TrustBadges from '@/components/home/TrustBadges';
import { Helmet } from 'react-helmet-async';
import { usePlatform } from '@/contexts/PlatformContext';

const Index = () => {
  const { settings } = usePlatform();

  return (
    <>
      <Helmet>
        <title>{settings.siteName} - Multi-Vendor Marketplace</title>
        <meta
          name="description"
          content="Discover unique products from trusted sellers worldwide. Shop handmade, vintage, and artisan goods on our curated marketplace."
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <TrustBadges />
          <CategoriesSection />
          <FeaturedProducts />
          <SellerCTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
