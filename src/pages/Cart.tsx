import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { usePlatform } from '@/contexts/PlatformContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { settings } = usePlatform();

  return (
    <>
      <Helmet>
        <title>Your Cart - {settings.siteName}</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 px-4">
          <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
            <Link to="/products">
              <Button variant="hero">
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Cart;
