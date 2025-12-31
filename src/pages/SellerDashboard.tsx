import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePlatform } from '@/contexts/PlatformContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentSeller, useRegisterAsSeller } from '@/hooks/useSellers';
import { useSellerProducts } from '@/hooks/useProducts';
import { useSellerOrders } from '@/hooks/useOrders';
import { useSellerBargainOffers } from '@/hooks/useBargainOffers';
import { Helmet } from 'react-helmet-async';
import ProductFormModal from '@/components/seller/ProductFormModal';
import { 
  Store,
  Package, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  Settings, 
  MessageSquare,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Bell,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';

const SellerDashboard = () => {
  const { settings } = usePlatform();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProductModal, setShowProductModal] = useState(false);

  const { data: currentSeller, isLoading: loadingSeller } = useCurrentSeller();
  const { data: sellerProducts, isLoading: loadingProducts } = useSellerProducts(currentSeller?.id || '');
  const { data: sellerOrders, isLoading: loadingOrders } = useSellerOrders(currentSeller?.id || '');
  const { data: bargainOffers, isLoading: loadingBargains } = useSellerBargainOffers(currentSeller?.id || '');

  // Calculate stats from real data
  const totalRevenue = sellerOrders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
  const totalProducts = sellerProducts?.length || 0;
  const totalOrders = sellerOrders?.length || 0;
  const pendingBargains = bargainOffers?.filter(b => b.status === 'pending').length || 0;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.5%', positive: true, icon: DollarSign },
    { label: 'Orders', value: totalOrders.toString(), change: '+8.2%', positive: true, icon: ShoppingCart },
    { label: 'Products', value: totalProducts.toString(), change: '+2', positive: true, icon: Package },
    { label: 'Store Views', value: '2,847', change: '-3.1%', positive: false, icon: Eye },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'bargains', label: 'Bargain Requests', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  // Loading state
  if (loadingSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not a seller - show registration form
  if (!currentSeller) {
    return <BecomeSellerForm settings={settings} />;
  }

  if (currentSeller.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <Loader2 className="h-12 w-12 text-warning mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Application Pending</h1>
          <p className="text-muted-foreground mb-6">
            Your seller application is under review. We'll notify you once it's approved.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (currentSeller.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Suspended</h1>
          <p className="text-muted-foreground mb-6">
            Your seller account has been suspended. Please contact support for more information.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Seller Dashboard - {settings.siteName}</title>
        <meta name="description" content="Manage your store, products, and orders" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="hidden font-display text-lg font-bold sm:inline-block">
                  {settings.siteName}
                </span>
              </Link>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Seller
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {pendingBargains > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {pendingBargains}
                  </span>
                )}
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                {currentSeller.business_name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 border-r border-border bg-background p-4 lg:block">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Commission Notice */}
            <div className="mt-6 rounded-xl border border-warning/50 bg-warning/10 p-4">
              <h4 className="font-medium text-warning-foreground">Commission Due</h4>
              <p className="mt-1 text-2xl font-bold text-warning-foreground">
                ${(currentSeller.pending_charges || 0).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-warning-foreground/70">
                {currentSeller.subscription_due_date 
                  ? `Due by ${new Date(currentSeller.subscription_due_date).toLocaleDateString()}`
                  : 'No pending dues'}
              </p>
              {(currentSeller.pending_charges || 0) > 0 && (
                <Button size="sm" className="mt-3 w-full" variant="warning">
                  Pay Now
                </Button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                  Welcome back, {currentSeller.business_name} 👋
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Here's what's happening with your store today
                </p>
              </div>
              <Button variant="hero" onClick={() => setShowProductModal(true)}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      stat.positive ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Orders */}
              <div className="rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Recent Orders
                  </h2>
                  <Button variant="ghost" size="sm">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {loadingOrders ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : sellerOrders && sellerOrders.length > 0 ? (
                    sellerOrders.slice(0, 4).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                            📦
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at || '').toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">${Number(order.total).toFixed(2)}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            order.status === 'delivered' ? 'bg-success/10 text-success' :
                            order.status === 'processing' ? 'bg-primary/10 text-primary' :
                            order.status === 'shipped' ? 'bg-accent/10 text-accent' :
                            'bg-warning/10 text-warning'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No orders yet
                    </div>
                  )}
                </div>
              </div>

              {/* Bargain Requests */}
              <div className="rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Bargain Requests
                  </h2>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {pendingBargains}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {loadingBargains ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : bargainOffers && bargainOffers.filter(b => b.status === 'pending').length > 0 ? (
                    bargainOffers.filter(b => b.status === 'pending').slice(0, 3).map((offer) => (
                      <div key={offer.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">Product Offer</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(offer.created_at || '').toLocaleDateString()}
                            </p>
                          </div>
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Offered</p>
                            <p className="font-bold text-primary">${Number(offer.offered_price).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" variant="seller">
                            Accept
                          </Button>
                          <Button size="sm" className="flex-1" variant="outline">
                            Counter
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No pending bargain requests
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        sellerId={currentSeller.id}
      />
    </>
  );
};

// Become a Seller Registration Form Component
const BecomeSellerForm = ({ settings }: { settings: any }) => {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const registerAsSeller = useRegisterAsSeller();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim()) {
      registerAsSeller.mutate(businessName.trim());
    }
  };

  return (
    <>
      <Helmet>
        <title>Become a Seller - {settings.siteName}</title>
        <meta name="description" content="Register as a seller and start selling your products" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero">
                <Store className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Become a Seller
              </h1>
              <p className="mt-2 text-muted-foreground">
                Start selling your products on {settings.siteName}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your business..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your application will be reviewed</li>
                  <li>Once approved, you can start adding products</li>
                  <li>Commission rate: {settings.commissionRate || 10}%</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="hero"
                disabled={!businessName.trim() || registerAsSeller.isPending}
              >
                {registerAsSeller.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>

              <Link to="/">
                <Button type="button" variant="ghost" className="w-full">
                  Back to Homepage
                </Button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;
