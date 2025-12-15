import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { usePlatform } from '@/contexts/PlatformContext';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { settings } = usePlatform();

  return (
    <>
      <Helmet>
        <title>Product Details - {settings.siteName}</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 px-4">
          <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-2xl bg-muted" />
            <div>
              <h1 className="font-display text-3xl font-bold">Sample Product</h1>
              <p className="text-2xl font-bold text-primary mt-4">$99.00</p>
              <p className="text-muted-foreground mt-4">Product description goes here.</p>
              <div className="flex gap-4 mt-8">
                <Button variant="hero" size="lg">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;
