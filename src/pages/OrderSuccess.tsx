import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, ArrowRight, Home, Loader2 } from 'lucide-react';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { settings } = usePlatform();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order Confirmed - {settings.siteName}</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10 mx-auto animate-scale-in">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            
            <h1 className="mt-6 font-display text-3xl font-bold text-foreground animate-slide-up">
              Order Confirmed!
            </h1>
            
            <p className="mt-2 text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Thank you for your purchase. Your order has been received.
            </p>

            {order && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-display text-lg font-semibold text-foreground">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-display text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-sm font-medium text-foreground">Order Items</p>
                  <div className="mt-3 space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                          {item.product_image || '📦'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-foreground">${item.total_price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">3-5 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/orders">
                <Button variant="hero">
                  <Package className="h-5 w-5" />
                  View Orders
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline">
                  <Home className="h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default OrderSuccess;