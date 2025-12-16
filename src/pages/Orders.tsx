import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCustomerOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import { Helmet } from 'react-helmet-async';
import { 
  Package, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-warning', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-primary', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-primary', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-accent', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-success', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-destructive', label: 'Cancelled' },
};

const Orders = () => {
  const { settings } = usePlatform();
  const { user } = useAuth();
  const { data: orders, isLoading } = useCustomerOrders();

  if (!user) {
    return (
      <>
        <Helmet>
          <title>My Orders - {settings.siteName}</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container px-4 py-16 lg:px-8">
            <div className="mx-auto max-w-md text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground" />
              <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
                Sign in to view orders
              </h1>
              <p className="mt-2 text-muted-foreground">
                Please sign in to see your order history
              </p>
              <Link to="/auth">
                <Button variant="hero" className="mt-6">Sign In</Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

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
        <title>My Orders - {settings.siteName}</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Orders</h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage your orders
          </p>

          {orders && orders.length > 0 ? (
            <div className="mt-8 space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Number</p>
                        <p className="font-display font-semibold text-foreground">{order.order_number}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.order_items.slice(0, 3).map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
                          >
                            <span className="text-lg">{item.product_image || '📦'}</span>
                            <span className="text-sm text-foreground">{item.product_name}</span>
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="flex items-center rounded-lg bg-muted/50 px-3 py-2">
                            <span className="text-sm text-muted-foreground">
                              +{order.order_items.length - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-display text-lg font-bold text-primary">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <Link to={`/order/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                No orders yet
              </h2>
              <p className="mt-2 text-muted-foreground">
                Start shopping to see your orders here
              </p>
              <Link to="/products">
                <Button variant="hero" className="mt-6">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Orders;